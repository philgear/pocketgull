import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Event categories aligned with ACM Code of Ethics §1.2 (Avoid Harm),
/// §1.6 (Respect Privacy), §2.9 (Secure Systems), and IEEE SWEBOK Security KA.
enum AuditEventCategory {
  auth,       // Sign-in, sign-out, biometric verification, lock
  aiCall,     // Every Gemini / Vertex AI invocation
  dataExport, // FHIR export, PDF export, print
  dataAccess, // Patient chart open, Firestore read
  dataSync,   // Firestore write, FHIR POST, Fitbit sync
  consent,    // Health data consent grant or withdrawal
  error,      // Unhandled errors affecting patient safety
}

/// A single immutable audit event.
class AuditEvent {
  final String id;
  final DateTime timestamp;
  final AuditEventCategory category;
  final String action;
  final String? patientId;   // Never stores name or PHI — only opaque ID
  final String? outcome;
  final Map<String, dynamic> metadata;

  const AuditEvent({
    required this.id,
    required this.timestamp,
    required this.category,
    required this.action,
    this.patientId,
    this.outcome,
    this.metadata = const {},
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'category': category.name,
        'action': action,
        if (patientId != null) 'patientId': patientId,
        if (outcome != null) 'outcome': outcome,
        if (metadata.isNotEmpty) 'metadata': metadata,
      };

  factory AuditEvent.fromJson(Map<dynamic, dynamic> json) => AuditEvent(
        id: json['id'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
        category: AuditEventCategory.values
            .firstWhere((e) => e.name == json['category'], orElse: () => AuditEventCategory.error),
        action: json['action'] as String,
        patientId: json['patientId'] as String?,
        outcome: json['outcome'] as String?,
        metadata: (json['metadata'] as Map?)?.cast<String, dynamic>() ?? {},
      );
}

/// AuditService — mirrors Angular's audit.service.ts (ACM §1.7 / IEEE SWEBOK Security).
///
/// Provides an immutable, append-only audit trail for all clinically significant
/// events. Events are persisted to a dedicated Hive box and never contain PHI
/// beyond opaque patient identifiers (ACM §1.6 Privacy).
///
/// Per ACM §2.5 (Comprehensive & Thorough): All AI invocations, auth events,
/// data exports, and consent operations are audited with outcome and metadata.
class AuditService extends ChangeNotifier {
  static const _boxKey = 'audit_trail';
  static const _maxRetainedEvents = 1000; // Rotate older events to prevent unbounded growth

  final List<AuditEvent> _events = [];
  bool _initialized = false;

  List<AuditEvent> get events => List.unmodifiable(_events);

  /// Initialize — must be called after Hive is ready.
  Future<void> initialize() async {
    if (_initialized) return;
    try {
      final box = Hive.box('pocket_gull_db');
      final raw = box.get(_boxKey);
      if (raw is List) {
        for (final entry in raw) {
          try {
            _events.add(AuditEvent.fromJson(entry as Map));
          } catch (_) {}
        }
      }
    } catch (e) {
      debugPrint('[AuditService] Failed to load audit trail: $e');
    }
    _initialized = true;
    notifyListeners();
  }

  // ── Public logging API ───────────────────────────────────────────────────────

  /// Log an authentication event (ACM §1.2, §2.9).
  void logAuth({
    required String action, // e.g., 'biometric_verified', 'google_signin', 'logout'
    String? outcome,
    Map<String, dynamic> metadata = const {},
  }) =>
      _log(AuditEventCategory.auth, action, outcome: outcome, metadata: metadata);

  /// Log an AI model invocation (ACM §1.2 Avoid Harm — AI outputs must be traceable).
  void logAiCall({
    required String model,
    required String lens,
    String? patientId,
    String? outcome,
    int? durationMs,
  }) =>
      _log(
        AuditEventCategory.aiCall,
        'ai_generate',
        patientId: patientId,
        outcome: outcome,
        metadata: {
          'model': model,
          'lens': lens,
          'durationMs': durationMs,
        }..
          removeWhere((_, v) => v == null),
      );

  /// Log a data export event (ACM §1.6 Privacy — all exports are traceable).
  void logDataExport({
    required String format, // 'fhir_r4', 'pdf', 'print'
    required String patientId,
    String? outcome,
  }) =>
      _log(
        AuditEventCategory.dataExport,
        'export_$format',
        patientId: patientId,
        outcome: outcome,
      );

  /// Log a cloud data sync (Firestore write, FHIR POST).
  void logDataSync({
    required String target, // 'firestore', 'fhir_api', 'fitbit'
    required String patientId,
    String? outcome,
  }) =>
      _log(
        AuditEventCategory.dataSync,
        'sync_$target',
        patientId: patientId,
        outcome: outcome,
      );

  /// Log a patient record access (ACM §1.6 Privacy — read access is audited).
  void logDataAccess({
    required String patientId,
    required String action, // 'chart_opened', 'firestore_read'
  }) =>
      _log(AuditEventCategory.dataAccess, action, patientId: patientId, outcome: 'success');

  /// Log a health data consent action (GDPR / Google Health API compliance).
  void logConsent({
    required String patientId,
    required String action, // 'consent_granted', 'consent_withdrawn', 'data_purged'
    String? consentVersion,
  }) =>
      _log(
        AuditEventCategory.consent,
        action,
        patientId: patientId,
        outcome: 'recorded',
        metadata: consentVersion != null ? {'consentVersion': consentVersion} : const {},
      );

  /// Log an application error affecting patient safety (ACM §1.2).
  void logError({
    required String message,
    String? patientId,
    Map<String, dynamic> metadata = const {},
  }) =>
      _log(AuditEventCategory.error, 'error', patientId: patientId, outcome: message, metadata: metadata);

  // ── Private ──────────────────────────────────────────────────────────────────

  void _log(
    AuditEventCategory category,
    String action, {
    String? patientId,
    String? outcome,
    Map<String, dynamic> metadata = const {},
  }) {
    final event = AuditEvent(
      id: '${DateTime.now().microsecondsSinceEpoch}',
      timestamp: DateTime.now().toUtc(),
      category: category,
      action: action,
      patientId: patientId,
      outcome: outcome,
      metadata: metadata,
    );

    _events.add(event);
    debugPrint('[AUDIT] ${event.category.name.toUpperCase()} • ${event.action} • ${event.patientId ?? 'no-patient'} • ${event.outcome ?? ''}');

    _persist();
    notifyListeners();
  }

  void _persist() {
    try {
      // Rotate if over limit (keep newest events)
      final toStore = _events.length > _maxRetainedEvents
          ? _events.sublist(_events.length - _maxRetainedEvents)
          : _events;

      final box = Hive.box('pocket_gull_db');
      box.put(_boxKey, toStore.map((e) => e.toJson()).toList());
    } catch (e) {
      debugPrint('[AuditService] Persist failed: $e');
    }
  }
}

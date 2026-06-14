import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// FirestoreSyncService — mirrors Angular's firestore-sync.service.ts.
///
/// Manages Firebase Auth state (Google Sign-In with allowlist enforcement) and
/// Firestore patient vault reads/writes under the clinician's namespace.
///
/// On platforms without Firebase credentials configured, falls back gracefully
/// to a mock-clinician mode that simulates auth without hitting the network.
class FirestoreSyncService extends ChangeNotifier {
  final FirebaseAuth? _auth;
  final FirebaseFirestore? _firestore;

  String? _currentUserId;
  String? _currentUserEmail;
  bool _isAuthLoading = true;

  String? get currentUserId => _currentUserId;
  String? get currentUserEmail => _currentUserEmail;
  bool get isAuthLoading => _isAuthLoading;
  bool get isAuthenticated => _currentUserId != null;

  static const _allowedEmail = 'philgear@gmail.com';
  static const _mockUid = 'mock-google-clinician';

  FirestoreSyncService({FirebaseAuth? auth, FirebaseFirestore? firestore})
      : _auth = auth,
        _firestore = firestore {
    _init();
  }

  void _init() {
    if (_auth == null) {
      _isAuthLoading = false;
      notifyListeners();
      return;
    }

    _auth.authStateChanges().listen((user) {
      _isAuthLoading = false;
      if (user != null) {
        if (user.email == _allowedEmail) {
          _currentUserId = user.uid;
          _currentUserEmail = user.email;
        } else {
          debugPrint('[Firebase Auth] Unauthorized email attempt: ${user.email}');
          _auth.signOut();
          _currentUserId = null;
          _currentUserEmail = null;
        }
      } else if (_currentUserId != _mockUid) {
        _currentUserId = null;
        _currentUserEmail = null;
      }
      notifyListeners();
    });
  }

  // ── Sign-in ──────────────────────────────────────────────────────────────────
  /// Signs in with Google. Falls back to mock credentials when Firebase
  /// is not fully configured.
  Future<void> signInWithGoogle() async {
    final isConfigured = _auth != null;
    if (!isConfigured) {
      debugPrint('[Firebase Auth] Not configured — using mock clinician credentials.');
      await Future.delayed(const Duration(milliseconds: 800));
      _currentUserId = _mockUid;
      _currentUserEmail = _allowedEmail;
      notifyListeners();
      return;
    }

    try {
      final provider = GoogleAuthProvider()
        ..addScope('profile')
        ..addScope('email');

      // Use signInWithProvider (cross-platform) instead of signInWithPopup (web-only)
      final result = await _auth.signInWithProvider(provider);
      if (result.user?.email != _allowedEmail) {
        debugPrint('[Firebase Auth] Unauthorized: ${result.user?.email}');
        await _auth.signOut();
        _currentUserId = null;
        _currentUserEmail = null;
        notifyListeners();
        throw Exception('Access Denied: Clinician account unauthorized.');
      }
    } catch (e) {
      debugPrint('[Firebase Auth] Sign-in failed: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    if (_auth != null && _currentUserId != _mockUid) {
      await _auth.signOut();
    }
    _currentUserId = null;
    _currentUserEmail = null;
    notifyListeners();
  }

  // ── Firestore Vault ──────────────────────────────────────────────────────────
  /// Pushes [patientData] to `clinicians/{uid}/patients/{patientId}` in Firestore.
  Future<void> syncPatientToCloud(String patientId, Map<String, dynamic> patientData) async {
    final uid = _currentUserId;
    if (uid == null) {
      debugPrint('[FirestoreSyncService] Cannot sync — not authenticated.');
      return;
    }
    if (uid == _mockUid || _firestore == null) {
      debugPrint('[FirestoreSyncService] Mock sync complete (no cloud write).');
      return;
    }

    final docRef = _firestore
        .collection('clinicians')
        .doc(uid)
        .collection('patients')
        .doc(patientId);

    await docRef.set(patientData, SetOptions(merge: true));
    debugPrint('[FirestoreSyncService] Synced $patientId to cloud vault.');
  }

  /// Fetches a patient chart from the Firestore vault.
  Future<Map<String, dynamic>?> fetchPatientFromCloud(String patientId) async {
    final uid = _currentUserId;
    if (uid == null) return null;
    if (uid == _mockUid || _firestore == null) {
      debugPrint('[FirestoreSyncService] Mock fetch (returning null).');
      return null;
    }

    final docRef = _firestore
        .collection('clinicians')
        .doc(uid)
        .collection('patients')
        .doc(patientId);

    final snap = await docRef.get();
    if (snap.exists) return snap.data();
    return null;
  }
}

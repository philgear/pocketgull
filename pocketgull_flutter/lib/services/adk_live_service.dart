import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as ws_status;

/// Connection state for the ADK Live WebSocket.
enum AdkLiveConnectionState {
  disconnected,
  connecting,
  connected,
  error,
}

/// A single transcript chunk from the live session.
class AdkLiveTurn {
  final String role; // 'user' or 'model'
  final String text;
  final DateTime timestamp;

  AdkLiveTurn({
    required this.role,
    required this.text,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

/// ADK Live WebSocket service — mirrors Angular's AdkLiveService.
///
/// Connects to the Express WebSocket proxy at `/ws/gemini-live` on Cloud Run,
/// which bridges to the Vertex AI Multimodal Live API for full-duplex
/// voice streaming. Manages session lifecycle, message serialization,
/// and graceful reconnection on interruption.
class AdkLiveService extends ChangeNotifier {
  // ── Config ────────────────────────────────────────────────────────────────────

  final String _wsBaseUrl;
  final String _model;

  // ── State ─────────────────────────────────────────────────────────────────────

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;

  AdkLiveConnectionState _connectionState = AdkLiveConnectionState.disconnected;
  final List<AdkLiveTurn> _transcript = [];
  String _pendingModelText = '';
  String? _sessionId;

  // ── Streams ───────────────────────────────────────────────────────────────────

  final _turnStreamController = StreamController<AdkLiveTurn>.broadcast();

  /// Stream of completed turns (user or model).
  Stream<AdkLiveTurn> get turnStream => _turnStreamController.stream;

  // ── Getters ───────────────────────────────────────────────────────────────────

  AdkLiveConnectionState get connectionState => _connectionState;
  bool get isConnected => _connectionState == AdkLiveConnectionState.connected;
  List<AdkLiveTurn> get transcript => List.unmodifiable(_transcript);
  String? get sessionId => _sessionId;

  AdkLiveService({
    String? wsBaseUrl,
    String? model,
  })  : _wsBaseUrl = wsBaseUrl ??
            'wss://pocket-gull-793190615625.us-west1.run.app',
        _model = model ?? 'gemini-2.5-flash';

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  /// Opens a live session with [systemPrompt] as the clinical context.
  ///
  /// Sends a `setup` message mirroring the Angular proxy protocol.
  Future<void> connect(String systemPrompt) async {
    if (_connectionState == AdkLiveConnectionState.connected ||
        _connectionState == AdkLiveConnectionState.connecting) {
      return;
    }

    _setConnectionState(AdkLiveConnectionState.connecting);

    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('$_wsBaseUrl/ws/gemini-live'),
      );

      // Send setup message — mirrors Angular's `setupMessage` format
      final setupMessage = {
        'setup': {
          'model': 'publishers/google/models/$_model',
          'system_instruction': {
            'parts': [
              {'text': systemPrompt}
            ]
          },
          'generation_config': {
            'response_modalities': ['TEXT'],
            'temperature': 0.3,
          },
        }
      };

      _channel!.sink.add(jsonEncode(setupMessage));

      _subscription = _channel!.stream.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDone,
      );

      _setConnectionState(AdkLiveConnectionState.connected);
      debugPrint('[AdkLiveService] Connected to Gemini Live proxy.');
    } catch (e) {
      debugPrint('[AdkLiveService] Connection failed: $e');
      _setConnectionState(AdkLiveConnectionState.error);
    }
  }

  /// Sends a text message as a client turn.
  void sendText(String text) {
    if (!isConnected) {
      debugPrint('[AdkLiveService] Cannot send — not connected.');
      return;
    }

    final userTurn = AdkLiveTurn(role: 'user', text: text);
    _transcript.add(userTurn);
    _turnStreamController.add(userTurn);
    notifyListeners();

    // Client turn format expected by the proxy
    final message = {
      'client_content': {
        'turns': [
          {
            'role': 'user',
            'parts': [
              {'text': text}
            ]
          }
        ],
        'turn_complete': true,
      }
    };

    _channel!.sink.add(jsonEncode(message));
  }

  /// Sends a raw audio chunk (base64-encoded PCM) to the live session.
  void sendAudioChunk(String base64Audio) {
    if (!isConnected) return;

    final message = {
      'realtime_input': {
        'media_chunks': [
          {
            'mime_type': 'audio/pcm',
            'data': base64Audio,
          }
        ]
      }
    };

    _channel!.sink.add(jsonEncode(message));
  }

  /// Closes the live session gracefully.
  Future<void> disconnect() async {
    await _subscription?.cancel();
    await _channel?.sink.close(ws_status.goingAway);
    _channel = null;
    _subscription = null;
    _sessionId = null;
    _pendingModelText = '';
    _setConnectionState(AdkLiveConnectionState.disconnected);
    debugPrint('[AdkLiveService] Disconnected.');
  }

  // ── Message Handling ──────────────────────────────────────────────────────────

  void _onMessage(dynamic rawMessage) {
    try {
      final data = jsonDecode(rawMessage as String) as Map<String, dynamic>;

      // Setup confirmation
      if (data.containsKey('setupComplete')) {
        _sessionId = data['setupComplete']['sessionId']?.toString();
        debugPrint('[AdkLiveService] Setup complete. Session: $_sessionId');
        return;
      }

      // Server content (model response)
      if (data.containsKey('serverContent')) {
        final serverContent = data['serverContent'] as Map<String, dynamic>;
        final modelTurn = serverContent['modelTurn'] as Map<String, dynamic>?;

        if (modelTurn != null) {
          final parts = modelTurn['parts'] as List<dynamic>? ?? [];
          for (final part in parts) {
            final text = (part as Map<String, dynamic>)['text'] as String?;
            if (text != null) {
              _pendingModelText += text;
            }
          }
        }

        // Turn complete — flush accumulated text
        final turnComplete = serverContent['turnComplete'] as bool? ?? false;
        if (turnComplete && _pendingModelText.isNotEmpty) {
          final modelTurnEntry = AdkLiveTurn(
            role: 'model',
            text: _pendingModelText.trim(),
          );
          _transcript.add(modelTurnEntry);
          _turnStreamController.add(modelTurnEntry);
          _pendingModelText = '';
          notifyListeners();
        }
      }

      // Interrupt signal from server
      if (data.containsKey('interrupted')) {
        debugPrint('[AdkLiveService] Session interrupted by server.');
        if (_pendingModelText.isNotEmpty) {
          final partial = AdkLiveTurn(
            role: 'model',
            text: '${_pendingModelText.trim()} [interrupted]',
          );
          _transcript.add(partial);
          _turnStreamController.add(partial);
          _pendingModelText = '';
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('[AdkLiveService] Message parse error: $e');
    }
  }

  void _onError(Object error) {
    debugPrint('[AdkLiveService] WebSocket error: $error');
    _setConnectionState(AdkLiveConnectionState.error);
  }

  void _onDone() {
    debugPrint('[AdkLiveService] WebSocket closed.');
    if (_connectionState != AdkLiveConnectionState.disconnected) {
      _setConnectionState(AdkLiveConnectionState.disconnected);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  void _setConnectionState(AdkLiveConnectionState state) {
    _connectionState = state;
    notifyListeners();
  }

  @override
  void dispose() {
    disconnect();
    _turnStreamController.close();
    super.dispose();
  }
}

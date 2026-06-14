import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/adk_live_service.dart';

/// Live Consult Screen — mirrors Angular's live-consult component.
///
/// Wires [AdkLiveService] to a premium full-screen UI: connection indicator,
/// scrollable transcript feed, text input, and mic toggle for audio PCM chunks.
class LiveConsultScreen extends StatefulWidget {
  const LiveConsultScreen({super.key});

  @override
  State<LiveConsultScreen> createState() => _LiveConsultScreenState();
}

class _LiveConsultScreenState extends State<LiveConsultScreen> {
  late final AdkLiveService _adkLive;

  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  StreamSubscription<AdkLiveTurn>? _turnSub;

  bool _isConnecting = false;

  @override
  void initState() {
    super.initState();
    _adkLive = context.read<AdkLiveService>();

    _turnSub = _adkLive.turnStream.listen((_) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    });
  }

  @override
  void dispose() {
    _turnSub?.cancel();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _connect() async {
    setState(() => _isConnecting = true);

    String systemPrompt =
        'You are Cerebella, a collaborative clinical AI co-pilot for Pocket Gull. '
        'You assist clinicians with real-time care strategy, symptom analysis, and '
        'protocol recommendations. Be concise, clinical, and actionable.\n\n';

    await _adkLive.connect(systemPrompt);
    setState(() => _isConnecting = false);
  }

  Future<void> _disconnect() async {
    await _adkLive.disconnect();
    setState(() {});
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty || !_adkLive.isConnected) return;
    _adkLive.sendText(text);
    _textController.clear();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _adkLive,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: const Color(0xFF0A0A0F),
          appBar: AppBar(
            backgroundColor: const Color(0xFF0F0F1A),
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 18),
              onPressed: () => Navigator.pop(context),
            ),
            title: Row(
              children: [
                _ConnectionIndicator(state: _adkLive.connectionState),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'CEREBELLA',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        letterSpacing: 2.0,
                      ),
                    ),
                    Text(
                      _statusLabel(_adkLive.connectionState),
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 10,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              if (_adkLive.transcript.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 18),
                  onPressed: () => _adkLive.disconnect(),
                  tooltip: 'Clear session',
                ),
              const SizedBox(width: 8),
            ],
          ),
          body: Column(
            children: [
              // ── Transcript ────────────────────────────────────────────────
              Expanded(
                child: _adkLive.transcript.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(20),
                        itemCount: _adkLive.transcript.length,
                        itemBuilder: (context, index) {
                          final turn = _adkLive.transcript[index];
                          return _TurnBubble(turn: turn);
                        },
                      ),
              ),

              // ── Input Bar ────────────────────────────────────────────────
              Container(
                color: const Color(0xFF0F0F1A),
                padding: EdgeInsets.fromLTRB(
                  16,
                  12,
                  16,
                  12 + MediaQuery.of(context).padding.bottom,
                ),
                child: Row(
                  children: [
                    // Connect / Disconnect
                    if (!_adkLive.isConnected)
                      _buildConnectButton()
                    else ...[
                      // Text field
                      Expanded(
                        child: TextField(
                          controller: _textController,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          cursorColor: const Color(0xFF6366F1),
                          decoration: InputDecoration(
                            hintText: 'Ask Cerebella…',
                            hintStyle: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                            filled: true,
                            fillColor: const Color(0xFF1A1A2E),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Send
                      _buildIconAction(
                        icon: Icons.send_rounded,
                        color: const Color(0xFF6366F1),
                        onTap: _sendMessage,
                      ),
                      const SizedBox(width: 8),

                      // Disconnect
                      _buildIconAction(
                        icon: Icons.stop_circle_outlined,
                        color: const Color(0xFFEF4444),
                        onTap: _disconnect,
                        tooltip: 'End session',
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    final isConnected = _adkLive.isConnected;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(Icons.psychology_alt_outlined, color: Colors.white, size: 40),
          ),
          const SizedBox(height: 24),
          const Text(
            'CEREBELLA',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 22,
              letterSpacing: 3.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isConnected
                ? 'Ready for your first message.'
                : 'Your AI clinical co-pilot.\nStart a session to begin.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade500, fontSize: 14, height: 1.5),
          ),
          if (!isConnected) ...[
            const SizedBox(height: 32),
            _buildConnectButton(),
          ],
        ],
      ),
    );
  }

  Widget _buildConnectButton() {
    return SizedBox(
      height: 48,
      child: ElevatedButton.icon(
        onPressed: _isConnecting ? null : _connect,
        icon: _isConnecting
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.play_circle_outline, size: 18),
        label: Text(_isConnecting ? 'CONNECTING…' : 'START SESSION'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6366F1),
          foregroundColor: Colors.white,
          textStyle: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _buildIconAction({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    String? tooltip,
  }) {
    return Material(
      color: color.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Tooltip(
          message: tooltip ?? '',
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Icon(icon, color: color, size: 20),
          ),
        ),
      ),
    );
  }

  String _statusLabel(AdkLiveConnectionState state) => switch (state) {
        AdkLiveConnectionState.connected => 'SESSION ACTIVE',
        AdkLiveConnectionState.connecting => 'CONNECTING…',
        AdkLiveConnectionState.error => 'CONNECTION ERROR',
        _ => 'OFFLINE',
      };
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _ConnectionIndicator extends StatelessWidget {
  final AdkLiveConnectionState state;
  const _ConnectionIndicator({required this.state});

  @override
  Widget build(BuildContext context) {
    final color = switch (state) {
      AdkLiveConnectionState.connected => const Color(0xFF10B981),
      AdkLiveConnectionState.connecting => const Color(0xFFF59E0B),
      AdkLiveConnectionState.error => const Color(0xFFEF4444),
      _ => const Color(0xFF6B7280),
    };

    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 6, spreadRadius: 1)],
      ),
    );
  }
}

class _TurnBubble extends StatelessWidget {
  final AdkLiveTurn turn;
  const _TurnBubble({required this.turn});

  @override
  Widget build(BuildContext context) {
    final isUser = turn.role == 'user';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.psychology_alt, color: Colors.white, size: 16),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser
                    ? const Color(0xFF6366F1).withValues(alpha: 0.15)
                    : const Color(0xFF1A1A2E),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isUser ? 16 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 16),
                ),
                border: Border.all(
                  color: isUser
                      ? const Color(0xFF6366F1).withValues(alpha: 0.3)
                      : Colors.white.withValues(alpha: 0.06),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isUser ? 'YOU' : 'CEREBELLA',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      color: isUser
                          ? const Color(0xFF818CF8)
                          : const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    turn.text,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUser) ...[
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.person_outline, color: Color(0xFF818CF8), size: 16),
            ),
          ],
        ],
      ),
    );
  }
}

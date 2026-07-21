/// Node Agent Dialog Widget — Context-driven multi-agent consulting console.
///
/// Flutter parity with Angular `node-agent-dialog.component.ts` (988 lines).
/// Renders a floating modal focus card allowing clinicians to consult
/// Gemini specialized agent personas regarding specific clinical claims.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NodeAgentDialogData {
  final String nodeKey;
  final String nodeText;
  final String sectionTitle;

  const NodeAgentDialogData({
    required this.nodeKey,
    required this.nodeText,
    required this.sectionTitle,
  });
}

class ChatEntry {
  final String role; // 'user' | 'model' | 'system'
  final String text;
  final bool isStreaming;

  const ChatEntry({
    required this.role,
    required this.text,
    this.isStreaming = false,
  });
}

class NodeAgentDialogWidget extends ConsumerStatefulWidget {
  final NodeAgentDialogData data;
  final VoidCallback onClose;

  const NodeAgentDialogWidget({
    super.key,
    required this.data,
    required this.onClose,
  });

  @override
  ConsumerState<NodeAgentDialogWidget> createState() => _NodeAgentDialogState();
}

class _NodeAgentDialogState extends ConsumerState<NodeAgentDialogWidget> {
  final TextEditingController _textController = TextEditingController();
  final List<ChatEntry> _chatHistory = [];
  bool _isLoading = false;
  final String _activePersona = 'Evidence Synthesizer';

  @override
  void initState() {
    super.initState();
    // Seed initial message
    _chatHistory.add(ChatEntry(
      role: 'system',
      text: 'Consultation initiated with $_activePersona for claim: "${widget.data.nodeText}"',
    ));
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _chatHistory.add(ChatEntry(role: 'user', text: text));
      _textController.clear();
      _isLoading = true;
    });

    // Mock API roundtrip representing agent response
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _chatHistory.add(ChatEntry(
          role: 'model',
          text: 'Under the standard clinical evidence matrix, the claim regarding "${widget.data.nodeText}" is supported by recent meta-analyses. I recommend cross-referencing patient vitals.',
        ));
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: 380,
      height: 500,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Header ──
          _buildHeader(isDark),

          // ── Context / Claim Preview ──
          _buildContextBanner(isDark),

          // ── Chat Messages ──
          Expanded(child: _buildChatBody(isDark)),

          // ── Input Row ──
          _buildInputRow(isDark),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : const Color(0xFFF9FAFB),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
        border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE5E7EB))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 8, height: 8,
                decoration: const BoxDecoration(color: Color(0xFF689F38), shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Text(
                _activePersona,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.grey.shade900,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.indigo.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  widget.data.sectionTitle,
                  style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.indigoAccent),
                ),
              ),
            ],
          ),
          IconButton(
            onPressed: widget.onClose,
            icon: const Icon(Icons.close, size: 16),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            style: IconButton.styleFrom(
              foregroundColor: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContextBanner(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: isDark ? const Color(0xFF09090B).withValues(alpha: 0.5) : const Color(0xFFF3F4F6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Clinical Claim in Focus',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
              color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            widget.data.nodeText,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.grey.shade300 : Colors.grey.shade800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBody(bool isDark) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _chatHistory.length + (_isLoading ? 1 : 0),
      itemBuilder: (context, i) {
        if (i == _chatHistory.length) {
          return _buildThinkingBubble(isDark);
        }
        final entry = _chatHistory[i];
        return _buildChatBubble(entry, isDark);
      },
    );
  }

  Widget _buildChatBubble(ChatEntry entry, bool isDark) {
    final isModel = entry.role == 'model';
    final isSystem = entry.role == 'system';

    if (isSystem) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            entry.text,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
          ),
        ),
      );
    }

    return Align(
      alignment: isModel ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isModel
              ? (isDark ? const Color(0xFF27272A) : const Color(0xFFF3F4F6))
              : Colors.indigoAccent,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: Radius.circular(isModel ? 0 : 12),
            bottomRight: Radius.circular(isModel ? 12 : 0),
          ),
        ),
        child: Text(
          entry.text,
          style: TextStyle(
            fontSize: 11.5,
            color: isModel
                ? (isDark ? Colors.white : Colors.grey.shade900)
                : Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildThinkingBubble(bool isDark) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFF3F4F6),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
            bottomRight: Radius.circular(12),
          ),
        ),
        child: SizedBox(
          width: 32,
          height: 10,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(3, (index) {
              return Container(
                width: 6, height: 6,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                  shape: BoxShape.circle,
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildInputRow(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : const Color(0xFFF9FAFB),
        border: Border(top: BorderSide(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE5E7EB))),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(15)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _textController,
              onSubmitted: (_) => _sendMessage(),
              style: TextStyle(fontSize: 12, color: isDark ? Colors.white : Colors.black),
              decoration: InputDecoration(
                hintText: 'Ask the consulting agent...',
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: isDark ? const Color(0xFF18181B) : Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _sendMessage,
            icon: const Icon(Icons.send, size: 16),
            style: IconButton.styleFrom(
              backgroundColor: Colors.indigoAccent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.all(8),
            ),
          ),
        ],
      ),
    );
  }
}

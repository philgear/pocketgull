import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'draggable_window.dart';

class ResearchFrameWidget extends StatefulWidget {
  final VoidCallback onClose;

  const ResearchFrameWidget({super.key, required this.onClose});

  @override
  State<ResearchFrameWidget> createState() => _ResearchFrameWidgetState();
}

class _ResearchFrameWidgetState extends State<ResearchFrameWidget> {
  late final WebViewController _controller;
  final TextEditingController _searchController = TextEditingController();
  String _currentEngine = 'google';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://www.google.com/search?q=clinical+anatomy'));
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    if (_currentEngine == 'google') {
      _controller.loadRequest(Uri.parse('https://www.google.com/search?q=${Uri.encodeComponent(query)}'));
    } else {
      // PubMed Search (Mock for now, or actual API call if key available)
      _controller.loadRequest(Uri.parse('https://pubmed.ncbi.nlm.nih.gov/?term=${Uri.encodeComponent(query)}'));
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableWindow(
      title: 'Research Frame',
      onClose: widget.onClose,
      child: Column(
        children: [
          // Toolbar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                // Toggle
                Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      _buildEngineButton('google', 'Google'),
                      _buildEngineButton('pubmed', 'PubMed'),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                // Input
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onSubmitted: (_) => _performSearch(),
                    decoration: InputDecoration(
                      hintText: 'Research patient complaint...',
                      hintStyle: const TextStyle(fontSize: 12),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.search, size: 20),
                  onPressed: _performSearch,
                  visualDensity: VisualDensity.compact,
                ),
                IconButton(
                  icon: const Icon(Icons.bookmark_border, size: 20),
                  onPressed: () {},
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          // Browser
          Expanded(
            child: WebViewWidget(controller: _controller),
          ),
        ],
      ),
    );
  }

  Widget _buildEngineButton(String id, String label) {
    final isSelected = _currentEngine == id;
    return GestureDetector(
      onTap: () => setState(() => _currentEngine = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          boxShadow: isSelected ? [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 2)
          ] : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black87 : Colors.grey,
          ),
        ),
      ),
    );
  }
}

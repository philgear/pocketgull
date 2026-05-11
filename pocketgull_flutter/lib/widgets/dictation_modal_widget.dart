import 'package:flutter/material.dart';
import '../services/dictation_service.dart';

class DictationModalWidget extends StatelessWidget {
  final DictationService dictationService;
  final VoidCallback onCancel;
  final Function(String) onAccept;

  const DictationModalWidget({
    super.key,
    required this.dictationService,
    required this.onCancel,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  ValueListenableBuilder<bool>(
                    valueListenable: dictationService.isListeningNotifier,
                    builder: (context, isListening, child) {
                      return Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isListening ? Colors.red.shade50 : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.mic,
                          color: isListening ? Colors.red : Colors.grey,
                          size: 20,
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'VOICE DICTATION',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                          letterSpacing: 1.2,
                        ),
                      ),
                      ValueListenableBuilder<bool>(
                        valueListenable: dictationService.isListeningNotifier,
                        builder: (context, isListening, child) {
                          return Text(
                            isListening ? 'Listening... Speak clearly.' : 'Paused. Review your text.',
                            style: TextStyle(
                              fontSize: 12,
                              color: isListening ? Colors.red.shade700 : Colors.grey,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                onPressed: onCancel,
                icon: const Icon(Icons.close, color: Colors.grey),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade100),
            ),
            constraints: const BoxConstraints(minHeight: 120, maxHeight: 200),
            child: ValueListenableBuilder<String>(
              valueListenable: dictationService.interimText,
              builder: (context, text, child) {
                return SingleChildScrollView(
                  child: Text(
                    text.isEmpty ? 'Start speaking or type here...' : text,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: text.isEmpty ? Colors.grey.shade400 : Colors.black87,
                      fontStyle: text.isEmpty ? FontStyle.italic : FontStyle.normal,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ValueListenableBuilder<bool>(
                valueListenable: dictationService.isListeningNotifier,
                builder: (context, isListening, child) {
                  return ElevatedButton.icon(
                    onPressed: () {
                      if (isListening) {
                        dictationService.stopListening();
                      } else {
                        dictationService.startListening((text, isFinal) {});
                      }
                    },
                    icon: Icon(isListening ? Icons.pause : Icons.play_arrow, size: 18),
                    label: Text(isListening ? 'PAUSE' : 'RESUME'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isListening ? Colors.grey.shade200 : Colors.red,
                      foregroundColor: isListening ? Colors.black87 : Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  );
                },
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: onCancel,
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.grey.shade600,
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                    ),
                    child: const Text('CANCEL'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: () => onAccept(dictationService.interimText.value),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black87,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('INSERT TEXT'),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

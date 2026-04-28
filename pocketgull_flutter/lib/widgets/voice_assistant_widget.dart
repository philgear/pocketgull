import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:speech_to_text/speech_recognition_result.dart';

class VoiceAssistantWidget extends StatefulWidget {
  const VoiceAssistantWidget({super.key});

  @override
  State<VoiceAssistantWidget> createState() => _VoiceAssistantWidgetState();
}

class _VoiceAssistantWidgetState extends State<VoiceAssistantWidget> {
  final SpeechToText _speechToText = SpeechToText();
  bool _speechEnabled = false;
  bool _isListening = false;
  String _lastWords = '';

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  void _initSpeech() async {
    _speechEnabled = await _speechToText.initialize();
    setState(() {});
  }

  void _startListening() async {
    await _speechToText.listen(
      onResult: _onSpeechResult,
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 5),
      listenOptions: SpeechListenOptions(
        partialResults: true,
        cancelOnError: true,
        listenMode: ListenMode.dictation,
      ),
    );
    setState(() {
      _isListening = true;
    });
  }

  void _stopListening() async {
    await _speechToText.stop();
    setState(() {
      _isListening = false;
    });
  }

  void _onSpeechResult(SpeechRecognitionResult result) {
    setState(() {
      _lastWords = result.recognizedWords;
    });
  }

  void _toggleListening() {
    if (_isListening) {
      _stopListening();
    } else {
      _startListening();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))],
      ),
      child: Row(
        children: [
          FloatingActionButton(
            mini: true,
            onPressed: _speechEnabled ? _toggleListening : null,
            backgroundColor: _isListening ? Colors.red : Theme.of(context).primaryColor,
            child: Icon(_isListening ? Icons.mic_off : Icons.mic, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              _speechToText.isListening
                  ? _lastWords.isEmpty
                      ? 'Listening...'
                      : _lastWords
                  : _speechEnabled
                      ? (_lastWords.isNotEmpty ? 'Dictated: $_lastWords' : 'Tap the microphone to start dictating...')
                      : 'Speech recognition not available on this device.',
              style: TextStyle(
                fontStyle: _speechToText.isListening || _lastWords.isEmpty ? FontStyle.italic : FontStyle.normal,
                color: _speechToText.isListening ? Colors.blue : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

import 'dart:html' as html;

void setupWebMessageListener(Function(String) onMessage) {
  html.window.onMessage.listen((event) {
    if (event.data is String) {
      onMessage(event.data as String);
    }
  });
}

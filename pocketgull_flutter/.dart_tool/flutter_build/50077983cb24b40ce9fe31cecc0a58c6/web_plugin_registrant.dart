// Flutter web plugin registrant file.
//
// Generated file. Do not edit.
//

// @dart = 2.13
// ignore_for_file: type=lint

import 'package:flutter_inappwebview_web/web/main.dart';
import 'package:flutter_tts/flutter_tts_web.dart';
import 'package:printing/printing_web.dart';
import 'package:shared_preferences_web/shared_preferences_web.dart';
import 'package:speech_to_text/speech_to_text_web.dart';
import 'package:webview_flutter_web/webview_flutter_web.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

void registerPlugins([final Registrar? pluginRegistrar]) {
  final Registrar registrar = pluginRegistrar ?? webPluginRegistrar;
  InAppWebViewFlutterPlugin.registerWith(registrar);
  FlutterTtsPlugin.registerWith(registrar);
  PrintingPlugin.registerWith(registrar);
  SharedPreferencesPlugin.registerWith(registrar);
  SpeechToTextPlugin.registerWith(registrar);
  WebWebViewPlatform.registerWith(registrar);
  registrar.registerMessageHandler();
}

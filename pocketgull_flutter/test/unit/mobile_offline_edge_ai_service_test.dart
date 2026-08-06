import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/ble_wearables_service.dart';
import 'package:pocketgull_flutter/services/mobile_offline_edge_ai_service.dart';

void main() {
  group('MobileOfflineEdgeAiService Fallback Suite', () {
    late BleWearablesService bleService;
    late MobileOfflineEdgeAiService edgeAiService;

    setUp(() {
      bleService = BleWearablesService();
      edgeAiService = MobileOfflineEdgeAiService(bleService: bleService);
    });

    test('initial offline mode state and active engine metadata', () {
      expect(edgeAiService.isOfflineModeForced, isFalse);
      expect(edgeAiService.activeEngineName, equals('BioBERT-Lite ONNX SLM'));
    });

    test('toggleForceOffline updates forced offline flag', () {
      expect(edgeAiService.isOfflineModeForced, isFalse);
      edgeAiService.toggleForceOffline();
      expect(edgeAiService.isOfflineModeForced, isTrue);
      edgeAiService.toggleForceOffline();
      expect(edgeAiService.isOfflineModeForced, isFalse);
    });

    test('synthesizeOfflineClinicalReport builds structured SBAR report with telemetry', () async {
      final mockVitals = BleVitalsData(
        heartRateBpm: 84,
        spO2Percent: 97.0,
        bodyTempCelsius: 37.0,
        sysBpMmHg: 122,
        diaBpMmHg: 78,
        timestamp: DateTime.now(),
      );

      final report = await edgeAiService.synthesizeOfflineClinicalReport(
        prompt: 'Patient complaining of mild acute respiratory shortness of breath',
        vitals: mockVitals,
      );

      expect(report.contains('MOBILE ON-DEVICE SLM EDGE INFERENCE'), isTrue);
      expect(report.contains('BioBERT-Lite ONNX SLM'), isTrue);
      expect(report.contains('84 bpm'), isTrue);
      expect(report.contains('97%'), isTrue);
    });
  });
}

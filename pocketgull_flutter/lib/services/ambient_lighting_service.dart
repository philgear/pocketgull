import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'circadian_sleepiness_service.dart';

class HueConfig {
  final String bridgeIp;
  final String username;
  final String lightId;
  final bool enabled;
  final bool useRelay;

  const HueConfig({
    required this.bridgeIp,
    required this.username,
    this.lightId = '1',
    this.enabled = false,
    this.useRelay = false,
  });

  HueConfig copyWith({
    String? bridgeIp,
    String? username,
    String? lightId,
    bool? enabled,
    bool? useRelay,
  }) {
    return HueConfig(
      bridgeIp: bridgeIp ?? this.bridgeIp,
      username: username ?? this.username,
      lightId: lightId ?? this.lightId,
      enabled: enabled ?? this.enabled,
      useRelay: useRelay ?? this.useRelay,
    );
  }
}

class EmergencyOverride {
  final bool active;
  final int hue;
  final int sat;
  final int bri;

  const EmergencyOverride({
    required this.active,
    required this.hue,
    required this.sat,
    required this.bri,
  });
}

class AmbientLightingService with ChangeNotifier {
  final CircadianSleepinessService _circadianService;
  
  HueConfig _hueConfig = const HueConfig(
    bridgeIp: '',
    username: '',
    lightId: '1',
    enabled: false,
    useRelay: false,
  );

  bool _isConnected = false;
  String? _lastError;
  EmergencyOverride _emergencyOverride = const EmergencyOverride(
    active: false,
    hue: 0,
    sat: 0,
    bri: 0,
  );

  HueConfig get hueConfig => _hueConfig;
  bool get isConnected => _isConnected;
  String? get lastError => _lastError;
  EmergencyOverride get emergencyOverride => _emergencyOverride;

  AmbientLightingService(this._circadianService) {
    _circadianService.addListener(_onCircadianChange);
  }

  @override
  void dispose() {
    _circadianService.removeListener(_onCircadianChange);
    super.dispose();
  }

  void updateConfig(HueConfig config) {
    _hueConfig = config;
    notifyListeners();
    _triggerSync();
  }

  void setEmergencyOverride(bool active, {int hue = 10000, int sat = 200, int bri = 50}) {
    _emergencyOverride = EmergencyOverride(active: active, hue: hue, sat: sat, bri: bri);
    notifyListeners();
    _triggerSync();
  }

  void _onCircadianChange() {
    _triggerSync();
  }

  void _triggerSync() {
    if (!_hueConfig.enabled || _hueConfig.bridgeIp.isEmpty || _hueConfig.username.isEmpty) {
      return;
    }

    if (_emergencyOverride.active) {
      _syncHueLight(
        _hueConfig,
        _emergencyOverride.hue,
        _emergencyOverride.sat,
        _emergencyOverride.bri,
      );
      return;
    }

    final currentTheme = _circadianService.circadian;
    final hueValue = ((currentTheme.colorHslData.h / 360.0) * 65535).round();
    final satValue = ((currentTheme.colorHslData.s / 100.0) * 254).round();
    final briValue = ((currentTheme.colorHslData.l / 100.0) * 254).round().clamp(10, 254);

    _syncHueLight(_hueConfig, hueValue, satValue, briValue);
  }

  Future<void> _syncHueLight(HueConfig config, int hue, int sat, int bri) async {
    String localHost = 'localhost';
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      localHost = '10.0.2.2';
    }

    final baseUrl = config.useRelay
        ? 'http://$localHost:8080/api/hue/${config.bridgeIp}'
        : 'http://${config.bridgeIp}';

    final url = '$baseUrl/api/${config.username}/lights/${config.lightId}/state';

    final payload = {
      'on': true,
      'hue': hue,
      'sat': sat,
      'bri': bri,
      'transitiontime': 40 // 4 seconds for smooth fading to match UI breathing
    };

    try {
      final response = await http.put(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );

      if (response.statusCode == 200) {
        _isConnected = true;
        _lastError = null;
      } else {
        _isConnected = false;
        _lastError = 'Hue Bridge returned status code ${response.statusCode}';
      }
    } catch (e) {
      debugPrint('Failed to sync Hue light: $e');
      _isConnected = false;
      _lastError = e.toString();
    } finally {
      notifyListeners();
    }
  }
}

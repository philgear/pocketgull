import 'dart:async';
import 'package:flutter/foundation.dart';

enum BleConnectionState {
  disconnected,
  scanning,
  connecting,
  connected,
  error,
}

class BleDiscoveredDevice {
  final String id;
  final String name;
  final int rssi;
  final List<String> serviceUuids;

  BleDiscoveredDevice({
    required this.id,
    required this.name,
    required this.rssi,
    required this.serviceUuids,
  });
}

class BleVitalsData {
  final int? heartRateBpm;
  final double? spO2Percent;
  final double? bodyTempCelsius;
  final int? sysBpMmHg;
  final int? diaBpMmHg;
  final double? cgmGlucoseMgDl;
  final DateTime timestamp;

  BleVitalsData({
    this.heartRateBpm,
    this.spO2Percent,
    this.bodyTempCelsius,
    this.sysBpMmHg,
    this.diaBpMmHg,
    this.cgmGlucoseMgDl,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'heartRateBpm': heartRateBpm,
      'spO2Percent': spO2Percent,
      'bodyTempCelsius': bodyTempCelsius,
      'sysBpMmHg': sysBpMmHg,
      'diaBpMmHg': diaBpMmHg,
      'cgmGlucoseMgDl': cgmGlucoseMgDl,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class BleWearablesService {
  BleConnectionState _state = BleConnectionState.disconnected;
  BleDiscoveredDevice? _activeDevice;
  BleVitalsData _currentVitals = BleVitalsData(
    heartRateBpm: 72,
    spO2Percent: 98.0,
    bodyTempCelsius: 37.0,
    sysBpMmHg: 120,
    diaBpMmHg: 80,
    cgmGlucoseMgDl: 95.0,
    timestamp: DateTime.now(),
  );

  final _vitalsController = StreamController<BleVitalsData>.broadcast();
  final _stateController = StreamController<BleConnectionState>.broadcast();

  BleConnectionState get state => _state;
  BleDiscoveredDevice? get activeDevice => _activeDevice;
  BleVitalsData get currentVitals => _currentVitals;

  Stream<BleVitalsData> get vitalsStream => _vitalsController.stream;
  Stream<BleConnectionState> get stateStream => _stateController.stream;

  // Standard GATT UUIDs
  static const String hrServiceUuid = '0000180d-0000-1000-8000-00805f9b34fb';
  static const String spo2ServiceUuid = '00001822-0000-1000-8000-00805f9b34fb';
  static const String tempServiceUuid = '00001809-0000-1000-8000-00805f9b34fb';
  static const String bpServiceUuid = '00001810-0000-1000-8000-00805f9b34fb';
  static const String cgmServiceUuid = '00001808-0000-1000-8000-00805f9b34fb';

  void startScan() {
    _state = BleConnectionState.scanning;
    _stateController.add(_state);
    if (kDebugMode) {
      print('[BleWearablesService] Scanning for Bluetooth LE clinical GATT monitors...');
    }
  }

  void connectDevice(BleDiscoveredDevice device) {
    _state = BleConnectionState.connecting;
    _stateController.add(_state);
    _activeDevice = device;

    // Simulate connection establishment
    Future.delayed(const Duration(milliseconds: 600), () {
      _state = BleConnectionState.connected;
      _stateController.add(_state);
      if (kDebugMode) {
        print('[BleWearablesService] Connected to GATT device: ${device.name} (${device.id})');
      }
    });
  }

  void disconnect() {
    _state = BleConnectionState.disconnected;
    _activeDevice = null;
    _stateController.add(_state);
  }

  void updateTelemetry({
    int? hr,
    double? spO2,
    double? temp,
    int? sysBp,
    int? diaBp,
    double? cgm,
  }) {
    _currentVitals = BleVitalsData(
      heartRateBpm: hr ?? _currentVitals.heartRateBpm,
      spO2Percent: spO2 ?? _currentVitals.spO2Percent,
      bodyTempCelsius: temp ?? _currentVitals.bodyTempCelsius,
      sysBpMmHg: sysBp ?? _currentVitals.sysBpMmHg,
      diaBpMmHg: diaBp ?? _currentVitals.diaBpMmHg,
      cgmGlucoseMgDl: cgm ?? _currentVitals.cgmGlucoseMgDl,
      timestamp: DateTime.now(),
    );
    _vitalsController.add(_currentVitals);
  }

  void dispose() {
    _vitalsController.close();
    _stateController.close();
  }
}

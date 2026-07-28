import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTCharacteristic = any;

export interface IWearableDeviceStatus {
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  batteryLevel?: number | null;
  lastUpdated: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BleWearablesService {
  private patientState = inject(PatientStateService);

  readonly isSupported = signal<boolean>(typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any));
  readonly isConnected = signal<boolean>(false);
  readonly deviceName = signal<string | null>(null);
  readonly heartRate = signal<number | null>(null);
  readonly statusMessage = signal<string>('Ready to pair wearable device (Apple Watch / Garmin / Polar)');

  private gattServer: BluetoothRemoteGATTServer | null = null;

  /**
   * Scans and connects to standard Bluetooth Low Energy (BLE) Heart Rate Monitors.
   */
  async connectHeartRateMonitor(): Promise<boolean> {
    if (!this.isSupported()) {
      this.statusMessage.set('Web Bluetooth API is not supported in this browser environment.');
      return false;
    }

    try {
      this.statusMessage.set('Scanning for BLE Heart Rate Monitors...');
      
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      this.deviceName.set(device.name || 'GATT Wearable Sensor');
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected.set(false);
        this.statusMessage.set('Device disconnected.');
      });

      this.statusMessage.set(`Connecting to ${this.deviceName()}...`);
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not establish GATT connection.');
      this.gattServer = server;

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.handleHeartRateNotification(event);
      });

      this.isConnected.set(true);
      this.statusMessage.set(`Connected to ${this.deviceName()}`);
      return true;

    } catch (err: any) {
      console.warn('[BleWearablesService] Bluetooth Pairing Error:', err);
      this.statusMessage.set(`Pairing error: ${err.message || 'Connection cancelled'}`);
      this.isConnected.set(false);
      return false;
    }
  }

  /**
   * Disconnects active BLE device session.
   */
  disconnect(): void {
    if (this.gattServer && this.gattServer.connected) {
      this.gattServer.disconnect();
    }
    this.isConnected.set(false);
    this.deviceName.set(null);
    this.heartRate.set(null);
    this.statusMessage.set('Disconnected.');
  }

  readonly spO2 = signal<number | null>(null);
  readonly temperature = signal<number | null>(null);
  readonly bloodPressure = signal<string | null>(null);

  /**
   * Scans and connects to standard Bluetooth Low Energy (BLE) Multi-Vitals Sensors (HR, SpO2, Temp, BP).
   */
  async connectMultiVitalsSensor(): Promise<boolean> {
    if (!this.isSupported()) {
      this.statusMessage.set('Web Bluetooth API is not supported in this browser environment.');
      return false;
    }

    try {
      this.statusMessage.set('Scanning for BLE Wearable Sensors (HR, SpO2, Thermometer, BP)...');
      
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['health_thermometer'] },
          { services: ['pulse_oximetry'] },
          { services: ['blood_pressure'] }
        ],
        optionalServices: ['battery_service', 'heart_rate', 'health_thermometer', 'pulse_oximetry', 'blood_pressure']
      });

      this.deviceName.set(device.name || 'GATT Multi-Vitals Sensor');
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected.set(false);
        this.statusMessage.set('Device disconnected.');
      });

      this.statusMessage.set(`Connecting to ${this.deviceName()}...`);
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not establish GATT connection.');
      this.gattServer = server;

      // 1. Heart Rate GATT Service
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleHeartRateNotification(ev));
      } catch (e) {
        console.info('[BLE] Heart Rate service optional or missing on device');
      }

      // 2. Health Thermometer GATT Service
      try {
        const tempService = await server.getPrimaryService('health_thermometer');
        const tempChar = await tempService.getCharacteristic('temperature_measurement');
        await tempChar.startNotifications();
        tempChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleTemperatureNotification(ev));
      } catch (e) {
        console.info('[BLE] Health Thermometer service optional or missing on device');
      }

      // 3. Pulse Oximeter GATT Service (SpO2)
      try {
        const oxService = await server.getPrimaryService('pulse_oximetry');
        const oxChar = await oxService.getCharacteristic('plx_continuous_measurement');
        await oxChar.startNotifications();
        oxChar.addEventListener('characteristicvaluechanged', (ev: any) => this.handleSpO2Notification(ev));
      } catch (e) {
        console.info('[BLE] Pulse Oximetry service optional or missing on device');
      }

      this.isConnected.set(true);
      this.statusMessage.set(`Connected to ${this.deviceName()} (Multi-Vitals Active)`);
      return true;

    } catch (err: any) {
      console.warn('[BleWearablesService] Bluetooth Pairing Error:', err);
      this.statusMessage.set(`Pairing error: ${err.message || 'Connection cancelled'}`);
      this.isConnected.set(false);
      return false;
    }
  }

  private handleHeartRateNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;

    let hr: number;
    if (is16Bit) {
      hr = value.getUint16(1, true);
    } else {
      hr = value.getUint8(1);
    }

    this.heartRate.set(hr);
    this.patientState.updateVital('hr', String(hr));
    this.statusMessage.set(`Live Wearable HR: ${hr} bpm`);
  }

  private handleTemperatureNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    // IEEE 11073-20601 FLOAT format (Exponent in upper byte, Mantissa in lower 3 bytes)
    const tempRaw = value.getFloat32(1, true);
    const tempF = Math.round((tempRaw * 1.8 + 32) * 10) / 10;

    this.temperature.set(tempF);
    this.patientState.updateVital('temp', `${tempF}°F`);
    this.statusMessage.set(`Live Wearable Temp: ${tempF}°F`);
  }

  private handleSpO2Notification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;

    const value = target.value;
    // Standard GATT SpO2 SFLOAT parser
    const spO2Val = value.getUint8(1);
    if (spO2Val > 50 && spO2Val <= 100) {
      this.spO2.set(spO2Val);
      this.patientState.updateVital('spO2', `${spO2Val}%`);
      this.statusMessage.set(`Live Wearable SpO2: ${spO2Val}%`);
    }
  }
}

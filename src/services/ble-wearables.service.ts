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
    this.statusMessage.set(`Live Wearable Telemetry: ${hr} bpm`);
  }
}

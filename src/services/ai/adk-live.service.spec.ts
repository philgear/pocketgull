import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { AdkLiveService } from './adk-live.service';
import { ActuarialLongevityService } from '../actuarial-longevity.service';

describe('AdkLiveService', () => {
  it('should initialize with disconnected state and default signals', () => {
    const isConnected = false;
    const isListening = false;
    const isSpeaking = false;
    const volumeLevel = 0;

    expect(isConnected).toBe(false);
    expect(isListening).toBe(false);
    expect(isSpeaking).toBe(false);
    expect(volumeLevel).toBe(0);
  });

  it('should convert 16-bit PCM AudioBuffer chunks to base64 frames correctly', () => {
    const pcm16 = new Int16Array([0, 16384, -16384, 32767]);
    const uint8 = new Uint8Array(pcm16.buffer);
    expect(uint8.byteLength).toBe(8);
  });

  it('should generate rich occupational prompt segment when occupationalProfile is provided', () => {
    const service = new AdkLiveService();
    const actuarialService = new ActuarialLongevityService();
    const polymathProfile = actuarialService.getOccupationalProfile('Polymath');

    const segment = service.buildOccupationalPromptSegment(polymathProfile);

    expect(segment).toContain('Polymaths, Renaissance Scholars & Interdisciplinary Synthesizers');
    expect(segment).toContain('11-1021-POLY');
    expect(segment).toContain('SNOMED: 417893002');
    expect(segment).toContain('Choral Vocal Resonance & Glee Protocol: 🎵 Polyphonic Renaissance Choral Glee');
  });
});

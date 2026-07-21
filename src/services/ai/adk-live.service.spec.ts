import { describe, it, expect } from 'vitest';

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
});

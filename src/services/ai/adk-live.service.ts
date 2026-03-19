import { Injectable, signal, NgZone, inject } from '@angular/core';

export interface LiveMessageEvent {
  text?: string;
  isFinal?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdkLiveService {
  private ngZone = inject(NgZone);

  public isConnected = signal(false);
  public isListening = signal(false);
  public isSpeaking = signal(false);
  public latestTranscript = signal('');
  public connectionError = signal<string | null>(null);

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private liveClient: any = null; // The Gemini Live WS connection
  
  // Audio playback queue
  private playbackContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;

  // Callbacks
  public onMessage?: (msg: LiveMessageEvent) => void;
  public onModelTurnComplete?: () => void;

  constructor() {}

  async connect(apiKey: string, systemInstruction: string) {
    if (this.isConnected()) return;
    this.connectionError.set(null);

    try {
      // We use the standard WebSocket approach directly to the Gemini API since the 
      // `@google/genai` types are sometimes missing browser specific live features depending on the beta version.
      // We route this through our backend proxy to securely affix the Referer headers required by restricted API keys.
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let url = `${protocol}//${window.location.host}/ws/gemini-live?key=${apiKey}`;
      // 4. Setup Audio Playback
      this.playbackContext = new AudioContext({ sampleRate: 24000 });

      // 5. Build outgoing audio graph
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input.length > 0) {
              const channelData = input[0];
              if (channelData) {
                this.port.postMessage(channelData);
              }
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      try {
        await this.audioContext.audioWorklet.addModule(workletUrl);
      } catch (e) {
        console.error("Failed to load audio worklet. Falling back...", e);
        // We could fallback, but modern browsers support this.
        throw new Error("AudioWorklet not supported or module missing.");
      }
      
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      this.audioWorkletNode.port.onmessage = (e) => {
        if (!this.isListening() || this.liveClient?.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.data; // Float32Array from worklet
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const uint8Array = new Uint8Array(pcm16.buffer);
        let binary = '';
        const len = uint8Array.byteLength;
        // In tight loops, avoid massive string concatenation if possible, but for 4096 framing this is okay.
        // A slightly faster way for large arrays is String.fromCharCode.apply, but it risks Call Stack limits.
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        const b64 = btoa(binary);

        this.liveClient.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{
              mimeType: 'audio/pcm;rate=16000',
              data: b64
            }]
          }
        }));
      };

      source.connect(this.audioWorkletNode);
      this.audioWorkletNode.connect(this.audioContext.destination);

      await new Promise<void>((resolve, reject) => {
        this.liveClient = new WebSocket(url);
  
        this.liveClient.onopen = () => {
          this.liveClient.send(JSON.stringify({
            setup: {
              model: 'models/gemini-2.0-flash-exp',
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                responseModalities: ["TEXT", "AUDIO"],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
                }
              }
            }
          }));
          this.ngZone.run(() => {
             this.isConnected.set(true);
             this.isListening.set(true);
          });
          console.log('[AdkLiveService] Connected to Gemini Live API');
          resolve();
        };
  
        this.liveClient.onmessage = (event: MessageEvent) => {
          this.handleLiveMessage(event.data);
        };
  
        this.liveClient.onclose = (ev: CloseEvent) => {
          console.warn(`[AdkLiveService] WebSocket closed: Code ${ev.code}, Reason: ${ev.reason || 'None provided'}`);
          if (ev.code !== 1000 && ev.code !== 1005 && !this.connectionError()) {
              this.ngZone.run(() => this.connectionError.set(`Connection Lost: Code ${ev.code} ${ev.reason}`));
          }
          this.handleDisconnect();
          reject(new Error(`WebSocket connection closed: Code ${ev.code}`));
        };
        
        this.liveClient.onerror = (err: Event) => {
          console.error('[AdkLiveService] Live API Error:', err);
          this.ngZone.run(() => this.connectionError.set('WebSocket Error'));
          this.handleDisconnect();
          reject(new Error('WebSocket connection error'));
        };
      });

    } catch (err: any) {
      console.error('Failed to connect to Live API:', err);
      this.ngZone.run(() => this.connectionError.set(err.message));
      this.disconnect();
      throw err;
    }
  }

  private handleLiveMessage(rawData: any) {
    let unparsedData;
    
    // The data might be a Blob if it's binary, but usually Gemini sends text frames with JSON
    if (rawData instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.processJsonMessage(JSON.parse(reader.result));
        }
      };
      reader.readAsText(rawData);
      return;
    } else if (typeof rawData === 'string') {
      try {
        unparsedData = JSON.parse(rawData);
      } catch (e) {
        console.error("Failed to parse Live message", e);
        return;
      }
    } else {
      unparsedData = rawData;
    }
    
    console.log("[AdkLiveService] Raw Live Message:", unparsedData);
    this.processJsonMessage(unparsedData);
  }

  private processJsonMessage(data: any) {
    if (data.error) {
      console.error("[AdkLiveService] Server returned error:", data.error);
      if (this.onMessage) {
         this.ngZone.run(() => {
             this.onMessage!({ text: `System Error: ${data.error.message || 'Unknown stream error'}` });
             if (this.onModelTurnComplete) this.onModelTurnComplete();
         });
      }
      return;
    }

    if (data.serverContent?.modelTurn?.parts) {
      const parts = data.serverContent.modelTurn.parts;
      for (const part of parts) {
        if (part.text) {
          if (this.onMessage) {
             this.ngZone.run(() => this.onMessage!({ text: part.text }));
          }
        }
        if (part.inlineData && part.inlineData.data) {
          // This is base64 encoded audio
          const binaryStr = atob(part.inlineData.data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          this.enqueueAudio(bytes.buffer);
        }
      }
    }
    
    if (data.serverContent?.turnComplete) {
      if (this.onModelTurnComplete) {
         this.ngZone.run(() => this.onModelTurnComplete!());
      }
    }
    
    // "Barge-in" signal: The server tells us it was interrupted.
    if (data.serverContent?.interrupted) {
      // Dump the audio queue immediately 
      this.clearAudioQueue();
    }
  }
  
  private async enqueueAudio(buffer: ArrayBuffer) {
    this.audioQueue.push(buffer);
    if (!this.isPlaying) {
      this.playNextAudio();
    }
  }
  
  private async playNextAudio() {
    if (this.audioQueue.length === 0 || !this.playbackContext) {
      this.isPlaying = false;
      this.ngZone.run(() => this.isSpeaking.set(false));
      return;
    }
    
    this.isPlaying = true;
    this.ngZone.run(() => this.isSpeaking.set(true));
    
    const arrayBuffer = this.audioQueue.shift()!;
    try {
      // Assuming 24000 PCM 16-bit Mono based on typical gemini streaming
      // If the incoming is raw PCM we have to create an AudioBuffer manually.
      // The GenAI SDK returns base64 PCM 16-bit 24kHz.
      const int16Array = new Int16Array(arrayBuffer);
      const audioBuffer = this.playbackContext.createBuffer(1, int16Array.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }
      
      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);
      source.onended = () => {
        this.playNextAudio();
      };
      source.start(0);
    } catch (e) {
      console.error("Audio playback error", e);
      this.playNextAudio();
    }
  }
  
  private clearAudioQueue() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.ngZone.run(() => this.isSpeaking.set(false));
    // Unfortunately BufferSource nodes cannot be easily stopped if already started without keeping a reference.
    // Given the short chunks, just letting it finish or doing a suspend/resume on context is an option.
  }

  startListening() {
    if (!this.isConnected()) return;
    this.isListening.set(true);
  }

  stopListening() {
    this.isListening.set(false);
  }

  sendText(text: string) {
    if (!this.isConnected() || !this.liveClient) return;
    this.liveClient.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true
      }
    }));
  }

  disconnect() {
    this.ngZone.run(() => {
      this.isListening.set(false);
      this.isConnected.set(false);
      this.isSpeaking.set(false);
    });
    
    if (this.liveClient) {
      try { this.liveClient.close(); } catch(e){}
      this.liveClient = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.audioQueue = [];
  }
  
  private handleDisconnect() {
    this.ngZone.run(() => {
      this.isConnected.set(false);
      this.isListening.set(false);
      this.isSpeaking.set(false);
    });
  }
}

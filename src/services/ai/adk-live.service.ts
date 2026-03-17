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
      // `@google/genai` types are sometimes missing browser specific live features depending on the beta version,
      // and it pulls in Node.js dependencies that break the Angular browser build.
      let url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        url = `ws://${window.location.host}/ws/gemini-live?key=${apiKey}`;
      }
      this.liveClient = new WebSocket(url);

      // 3. Setup WebSocket Listeners
      this.liveClient.onopen = () => {
        // Send initial setup
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
        
        // Wait for setup complete before fully activating
      };

      this.liveClient.onmessage = (event: MessageEvent) => {
        this.handleLiveMessage(event.data);
      };

      this.liveClient.onclose = () => this.handleDisconnect();
      this.liveClient.onerror = (err: Event) => {
        console.error('Live API Error:', err);
        this.ngZone.run(() => this.connectionError.set('WebSocket Error'));
        this.disconnect();
      };

      // 4. Setup Audio Playback
      this.playbackContext = new AudioContext({ sampleRate: 24000 });

      // 5. Build outgoing audio graph
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      
      // We need a script processor or audio worklet to capture PCM data
      // For simplicity in this implementation, we use a ScriptProcessorNode (deprecated but widely supported)
      // Ideally this would be an AudioWorklet for performance.
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!this.isListening() || this.liveClient?.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Base64 encode the PCM data
        const uint8Array = new Uint8Array(pcm16.buffer);
        let binary = '';
        const len = uint8Array.byteLength;
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

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      this.ngZone.run(() => {
        this.isConnected.set(true);
        this.isListening.set(true);
      });
      console.log('Connected to Gemini Live API');
      
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

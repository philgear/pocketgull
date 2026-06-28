import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService, BODY_PART_NAMES } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { PetAuditoryService } from './pet-auditory.service';
import { AmbientLightingService } from './ambient-lighting.service';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class DictationService {
  private state = inject(PatientStateService);
  private patientMgmt = inject(PatientManagementService);
  private petAuditory = inject(PetAuditoryService);
  private lighting = inject(AmbientLightingService);

  readonly isListening = signal(false);
  readonly isModalOpen = signal(false);
  readonly permissionError = signal<string | null>(null);
  readonly initialText = signal('');
  readonly lastCommand = signal<string | null>(null);

  private recognition: any;
  private onAcceptCallback: ((text: string) => void) | null = null;
  private resultCallback: ((text: string, isFinal: boolean) => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') {
      this.permissionError.set("Voice dictation is not supported during SSR.");
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      this.permissionError.set("Voice dictation is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.permissionError.set(null);
      this.isListening.set(true);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        this.permissionError.set('Microphone access denied.');
      } else if (event.error === 'no-speech') {
        // Ignore
      } else {
        this.permissionError.set(`Error: ${event.error}`);
      }
      this.isListening.set(false);
    };

    // Helper map to normalize spoken body parts to keys
    const bodyPartMap = new Map(Object.entries(BODY_PART_NAMES).map(([k, v]) => [v.toLowerCase(), k]));

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      // --- COMMAND ROUTER (Intercept Voice Commands) ---
      if (final) {
        const lowerFinal = final.toLowerCase().trim();

        // --- EMERGENCY AVS OVERRIDE (High priority safety trigger, no wake word required) ---
        const isEmergencyCommand = 
            lowerFinal.includes('stop avs') || 
            lowerFinal.includes('stop session') || 
            lowerFinal.includes('seizure emergency') || 
            lowerFinal.includes('emergency stop') ||
            lowerFinal.includes('terminate avs') ||
            lowerFinal.includes('shut down avs') ||
            (lowerFinal.startsWith('gull') && (lowerFinal.includes('stop') || lowerFinal.includes('abort') || lowerFinal.includes('halt')));

        if (isEmergencyCommand) {
            console.warn("[Voice Command] EMERGENCY AVS STOP COMMAND DETECTED!");
            this.lastCommand.set("EMERGENCY AVS STOPPED");
            
            // Shut down AVS and restore normal lighting and soundscapes
            this.state.isAvsSessionActive.set(false);
            this.lighting.setEmergencyOverride(false);
            this.petAuditory.stop();
            
            setTimeout(() => this.lastCommand.set(null), 3000);
            return; // Consume the command
        }

        // Look for the wake word "gull" (or common mishearings like "goal", "go")
        if (lowerFinal.startsWith('gull') || lowerFinal.startsWith('goal') || lowerFinal.startsWith('go ') || lowerFinal.startsWith('girl')) {
            if (lowerFinal.includes('sync') || lowerFinal.includes('save')) {
                console.log("[Voice Command] Triggering Sync...");
                this.lastCommand.set("Data Synced");
                this.patientMgmt.syncToCloud();
                
                // Clear the feedback after 2s
                setTimeout(() => this.lastCommand.set(null), 2000);
                return; // Consume the command, don't pass to dictation
            }

            if (lowerFinal.includes('highlight') || lowerFinal.includes('select') || lowerFinal.includes('isolate')) {
                const words = lowerFinal.split(' ');
                for (const [partName, partKey] of bodyPartMap.entries()) {
                    if (lowerFinal.includes(partName)) {
                        console.log(`[Voice Command] Highlighting ${partName} (${partKey})`);
                        this.lastCommand.set(`Highlighted ${partName}`);
                        this.state.selectPart(partKey);
                        setTimeout(() => this.lastCommand.set(null), 2000);
                        return; // Consume
                    }
                }
            }
        }
      }

      // Regular dictation pass-through
      if (this.resultCallback) {
        if (final) this.resultCallback(final, true);
        if (interim) this.resultCallback(interim, false);
      }
    };
  }

  openDictationModal(initialText: string = '', onAccept: (text: string) => void) {
    this.initialText.set(initialText);
    this.onAcceptCallback = onAccept;
    this.isModalOpen.set(true);
    // We don't auto-start here, let the modal component handle starting via user action or auto-start logic
  }

  startRecognition() {
    if (!this.recognition) return;
    try {
      this.recognition.start();
    } catch (e) {
      // Already started
    }
  }

  stopRecognition() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  cancel() {
    this.stopRecognition();
    this.isModalOpen.set(false);
    this.onAcceptCallback = null;
    this.resultCallback = null;
  }

  accept(finalText: string) {
    this.stopRecognition();
    if (this.onAcceptCallback) {
      this.onAcceptCallback(finalText);
    }
    this.isModalOpen.set(false);
    this.onAcceptCallback = null;
    this.resultCallback = null;
  }

  registerResultHandler(callback: (text: string, isFinal: boolean) => void) {
    this.resultCallback = callback;
  }
}

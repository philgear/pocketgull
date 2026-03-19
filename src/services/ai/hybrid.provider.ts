import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntelligenceProvider } from './intelligence.provider';
import { GeminiProvider } from './gemini.provider';
import { PubGemmaProvider } from './pubgemma.provider';
import { NanoProvider } from './nano.provider';
import { WebLLMProvider } from './webllm.provider';
import { ClinicalMetrics } from '../clinical-intelligence.service';
import { VerificationIssue } from '../../components/analysis-report.types';

@Injectable({
  providedIn: 'root'
})
export class HybridProvider implements IntelligenceProvider {
  private gemini = inject(GeminiProvider);
  private ollama = inject(PubGemmaProvider);
  private nano = inject(NanoProvider);
  private webgpu = inject(WebLLMProvider);

  generateReportStream(patientData: string, lens: string, systemInstruction: string): Observable<string> {
    return new Observable<string>(observer => {
      this.ollama.generateReportStream(patientData, lens, systemInstruction).subscribe({
        next: (val) => observer.next(val),
        complete: () => observer.complete(),
        error: (errOllama) => {
          console.warn('Ollama API failed, falling back to WebGPU:', errOllama);
          observer.next('\n\n_⚡ Local Ollama unavailable. Switching to WebGPU Inference (Browser Engine)..._\n\n');
          
          this.webgpu.generateReportStream(patientData, lens, systemInstruction).subscribe({
            next: (val) => observer.next(val),
            complete: () => observer.complete(),
            error: (errWeb) => {
              console.warn('WebGPU failed, falling back to Browser Nano:', errWeb);
              observer.next('\n\n_⚡ WebGPU unavailable. Switching to Chrome On-Device AI (Nano)..._\n\n');
              
              this.nano.generateReportStream(patientData, lens, systemInstruction).subscribe({
                next: (val) => observer.next(val),
                complete: () => observer.complete(),
                error: (errNano) => {
                    console.warn('Nano failed, routing securely to Gemini Cloud API:', errNano);
                    observer.next('\n\n_⚡ Nano unavailable. Dispatched to Cloud Server (Gemini)..._\n\n');
                    this.gemini.generateReportStream(patientData, lens, systemInstruction).subscribe({
                        next: (v) => observer.next(v),
                        complete: () => observer.complete(),
                        error: (errGem) => observer.error(`All Intelligence Engines failed.\nOllama: ${errOllama.message}\nWebGPU: ${errWeb.message}\nNano: ${errNano.message}\nGemini: ${errGem.message}`)
                    });
                }
              });
            }
          });
        }
      });
    });
  }

  async generateMetrics(reportText: string): Promise<ClinicalMetrics> {
    try { return await this.ollama.generateMetrics(reportText); } catch (e1) {
      try { return await this.webgpu.generateMetrics(reportText); } catch (e2) {
        try { return await this.nano.generateMetrics(reportText); } catch (e3) {
            return await this.gemini.generateMetrics(reportText);
        }
      }
    }
  }

  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    try { return await this.ollama.detectClinicalChanges(oldData, newData); } catch (e1) {
      try { return await this.webgpu.detectClinicalChanges(oldData, newData); } catch (e2) {
        try { return await this.nano.detectClinicalChanges(oldData, newData); } catch (e3) {
            return await this.gemini.detectClinicalChanges(oldData, newData);
        }
      }
    }
  }

  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: VerificationIssue[] }> {
    try { return await this.ollama.verifySection(lens, content, sourceData); } catch (e1) {
      try { return await this.webgpu.verifySection(lens, content, sourceData); } catch (e2) {
        try { return await this.nano.verifySection(lens, content, sourceData); } catch (e3) {
            return await this.gemini.verifySection(lens, content, sourceData);
        }
      }
    }
  }

  async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
    try { return await this.ollama.translateReadingLevel(text, level); } catch (e1) {
      try { return await this.webgpu.translateReadingLevel(text, level); } catch (e2) {
        try { return await this.nano.translateReadingLevel(text, level); } catch (e3) {
            return await this.gemini.translateReadingLevel(text, level);
        }
      }
    }
  }

  async analyzeTranslation(original: string, translated: string): Promise<string> {
    try { return await this.ollama.analyzeTranslation(original, translated); } catch (e1) {
      try { return await this.webgpu.analyzeTranslation(original, translated); } catch (e2) {
        try { return await this.nano.analyzeTranslation(original, translated); } catch (e3) {
            return await this.gemini.analyzeTranslation(original, translated);
        }
      }
    }
  }

  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    try { return await this.ollama.analyzeImage(base64Image, context); } catch (e1) {
      try { return await this.webgpu.analyzeImage(base64Image, context); } catch (e2) {
        try { return await this.nano.analyzeImage(base64Image, context); } catch (e3) {
            return await this.gemini.analyzeImage(base64Image, context);
        }
      }
    }
  }

  async startChat(patientData: string, context: string): Promise<void> {
    try { await this.ollama.startChat(patientData, context); } catch (e1) {
      try { await this.webgpu.startChat(patientData, context); } catch (e2) {
        try { await this.nano.startChat(patientData, context); } catch (e3) {
            await this.gemini.startChat(patientData, context);
        }
      }
    }
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    try { return await this.ollama.sendMessage(message, files); } catch (e1) {
      try { return await this.webgpu.sendMessage(message, files); } catch (e2) {
        try { return await this.nano.sendMessage(message, files); } catch (e3) {
            return await this.gemini.sendMessage(message, files);
        }
      }
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    try { return await this.ollama.getInitialGreeting(prompt); } catch (e1) {
      try { return await this.webgpu.getInitialGreeting(prompt); } catch (e2) {
        try { return await this.nano.getInitialGreeting(prompt); } catch (e3) {
            return await this.gemini.getInitialGreeting(prompt);
        }
      }
    }
  }
}

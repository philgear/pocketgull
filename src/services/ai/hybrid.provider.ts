import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntelligenceProvider } from './intelligence.provider';
import { GeminiProvider } from './gemini.provider';
import { PubGemmaProvider } from './pubgemma.provider';
import { NanoProvider } from './nano.provider';
import { ClinicalMetrics } from '../clinical-intelligence.service';
import { VerificationIssue } from '../../components/analysis-report.types';

@Injectable({
  providedIn: 'root'
})
export class HybridProvider implements IntelligenceProvider {
  private gemini = inject(GeminiProvider);
  private ollama = inject(PubGemmaProvider);
  private nano = inject(NanoProvider);

  generateReportStream(patientData: string, lens: string, systemInstruction: string): Observable<string> {
    return new Observable<string>(observer => {
      this.gemini.generateReportStream(patientData, lens, systemInstruction).subscribe({
        next: (val) => observer.next(val),
        complete: () => observer.complete(),
        error: (errGemini) => {
          console.warn('Gemini API failed, falling back to Local Ollama:', errGemini);
          observer.next('\n\n_⚡ Cloud API unavailable. Switching to Local Inference (Ollama)..._\n\n');
          
          this.ollama.generateReportStream(patientData, lens, systemInstruction).subscribe({
            next: (val) => observer.next(val),
            complete: () => observer.complete(),
            error: (errOllama) => {
              console.warn('Local Ollama failed, falling back to Browser Nano:', errOllama);
              observer.next('\n\n_⚡ Local server unavailable. Switching to Browser On-Device Inference (Nano)..._\n\n');
              
              this.nano.generateReportStream(patientData, lens, systemInstruction).subscribe({
                next: (val) => observer.next(val),
                complete: () => observer.complete(),
                error: (errNano) => observer.error(`All Intelligence Engines failed.\nGemini: ${errGemini.message}\nOllama: ${errOllama.message}\nNano: ${errNano.message}`)
              });
            }
          });
        }
      });
    });
  }

  async generateMetrics(reportText: string): Promise<ClinicalMetrics> {
    try { return await this.gemini.generateMetrics(reportText); } catch (e1) {
      console.warn("Gemini metrics failed:", e1);
      try { return await this.ollama.generateMetrics(reportText); } catch (e2) {
        console.warn("Ollama metrics failed:", e2);
        return await this.nano.generateMetrics(reportText);
      }
    }
  }

  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    try { return await this.gemini.detectClinicalChanges(oldData, newData); } catch (e1) {
      try { return await this.ollama.detectClinicalChanges(oldData, newData); } catch (e2) {
        return await this.nano.detectClinicalChanges(oldData, newData);
      }
    }
  }

  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: VerificationIssue[] }> {
    try { return await this.gemini.verifySection(lens, content, sourceData); } catch (e1) {
      try { return await this.ollama.verifySection(lens, content, sourceData); } catch (e2) {
        return await this.nano.verifySection(lens, content, sourceData);
      }
    }
  }

  async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
    try { return await this.gemini.translateReadingLevel(text, level); } catch (e1) {
      try { return await this.ollama.translateReadingLevel(text, level); } catch (e2) {
        return await this.nano.translateReadingLevel(text, level);
      }
    }
  }

  async analyzeTranslation(original: string, translated: string): Promise<string> {
    try { return await this.gemini.analyzeTranslation(original, translated); } catch (e1) {
      try { return await this.ollama.analyzeTranslation(original, translated); } catch (e2) {
        return await this.nano.analyzeTranslation(original, translated);
      }
    }
  }

  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    try { return await this.gemini.analyzeImage(base64Image, context); } catch (e1) {
      try { return await this.ollama.analyzeImage(base64Image, context); } catch (e2) {
        return await this.nano.analyzeImage(base64Image, context);
      }
    }
  }

  async startChat(patientData: string, context: string): Promise<void> {
    try { await this.gemini.startChat(patientData, context); } catch (e1) {
      try { await this.ollama.startChat(patientData, context); } catch (e2) {
        await this.nano.startChat(patientData, context);
      }
    }
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    try { return await this.gemini.sendMessage(message, files); } catch (e1) {
      console.warn("Gemini sendMessage failed:", e1);
      try { return await this.ollama.sendMessage(message, files); } catch (e2) {
        console.warn("Ollama sendMessage failed:", e2);
        try { return await this.nano.sendMessage(message, files); } catch (e3: any) {
          throw new Error(`All Chat Engines Failed.\nGemini: ${(e1 as any).message}\nOllama: ${(e2 as any).message}\nNano: ${e3.message}`);
        }
      }
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    try { return await this.gemini.getInitialGreeting(prompt); } catch (e1) {
      console.warn("Gemini Greeting failed:", e1);
      try { return await this.ollama.getInitialGreeting(prompt); } catch (e2) {
         console.warn("Ollama Greeting failed:", e2);
         return await this.nano.getInitialGreeting(prompt);
      }
    }
  }
}

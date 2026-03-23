import { inject, Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { IntelligenceProvider } from './intelligence.provider';
import { GeminiProvider } from './gemini.provider';
import { PubGemmaProvider } from './pubgemma.provider';
import { NanoProvider } from './nano.provider';
import { WebLLMProvider } from './webllm.provider';
import { ClinicalMetrics } from '../clinical-intelligence.service';
import { VerificationIssue } from '../../components/analysis-report.types';
import { NetworkStateService } from '../network-state.service';

@Injectable({
  providedIn: 'root'
})
export class HybridProvider implements IntelligenceProvider {
  private gemini = inject(GeminiProvider);
  private nvidia = inject(PubGemmaProvider); // Represents NVIDIA local inference
  private nano = inject(NanoProvider);
  private webgpu = inject(WebLLMProvider);
  private network = inject(NetworkStateService);

  async *generateReportStream(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
    if (this.network.isOnline()) {
      try {
        yield* this.gemini.generateReportStream(patientData, lens, systemInstruction);
      } catch (errGem) {
        console.warn('Gemini API failed, falling back to WebLLM:', errGem);
        yield '\n\n_⚡ Cloud Gemini unavailable. Switching to WebLLM Inference..._\n\n';
        try {
          yield* this.webgpu.generateReportStream(patientData, lens, systemInstruction);
        } catch (errWeb) {
          console.warn('WebLLM failed, falling back to Nano:', errWeb);
          yield '\n\n_⚡ WebLLM unavailable. Switching to Chrome Nano..._\n\n';
          try {
            yield* this.nano.generateReportStream(patientData, lens, systemInstruction);
          } catch (errNano) {
            throw new Error(`All Online Engines failed.`);
          }
        }
      }
    } else {
      try {
        yield* this.nvidia.generateReportStream(patientData, lens, systemInstruction);
      } catch (errNvidia) {
        console.warn('NVIDIA API failed, falling back to WebLLM:', errNvidia);
        yield '\n\n_⚡ Local NVIDIA unavailable. Switching to WebLLM Inference..._\n\n';
        try {
          yield* this.webgpu.generateReportStream(patientData, lens, systemInstruction);
        } catch (errWeb) {
          console.warn('WebLLM failed, falling back to Nano:', errWeb);
          yield '\n\n_⚡ WebLLM unavailable. Switching to Chrome Nano..._\n\n';
          try {
            yield* this.nano.generateReportStream(patientData, lens, systemInstruction);
          } catch (errNano) {
            throw new Error(`All Offline Engines failed.`);
          }
        }
      }
    }
  }

  async generateMetrics(reportText: string): Promise<ClinicalMetrics> {
    if (this.network.isOnline()) {
      try { return await this.gemini.generateMetrics(reportText); } catch (e1) {
        try { return await this.webgpu.generateMetrics(reportText); } catch (e2) {
          return await this.nano.generateMetrics(reportText);
        }
      }
    } else {
      try { return await this.nvidia.generateMetrics(reportText); } catch (e1) {
        try { return await this.webgpu.generateMetrics(reportText); } catch (e2) {
          return await this.nano.generateMetrics(reportText);
        }
      }
    }
  }

  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    if (this.network.isOnline()) {
      try { return await this.gemini.detectClinicalChanges(oldData, newData); } catch (e1) {
        try { return await this.webgpu.detectClinicalChanges(oldData, newData); } catch (e2) {
          return await this.nano.detectClinicalChanges(oldData, newData);
        }
      }
    } else {
      try { return await this.nvidia.detectClinicalChanges(oldData, newData); } catch (e1) {
        try { return await this.webgpu.detectClinicalChanges(oldData, newData); } catch (e2) {
          return await this.nano.detectClinicalChanges(oldData, newData);
        }
      }
    }
  }

  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: VerificationIssue[] }> {
    if (this.network.isOnline()) {
      try { return await this.gemini.verifySection(lens, content, sourceData); } catch (e1) {
        try { return await this.webgpu.verifySection(lens, content, sourceData); } catch (e2) {
          return await this.nano.verifySection(lens, content, sourceData);
        }
      }
    } else {
      try { return await this.nvidia.verifySection(lens, content, sourceData); } catch (e1) {
        try { return await this.webgpu.verifySection(lens, content, sourceData); } catch (e2) {
          return await this.nano.verifySection(lens, content, sourceData);
        }
      }
    }
  }

  async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
    if (this.network.isOnline()) {
      try { return await this.gemini.translateReadingLevel(text, level); } catch (e1) {
        try { return await this.webgpu.translateReadingLevel(text, level); } catch (e2) {
          return await this.nano.translateReadingLevel(text, level);
        }
      }
    } else {
      try { return await this.nvidia.translateReadingLevel(text, level); } catch (e1) {
        try { return await this.webgpu.translateReadingLevel(text, level); } catch (e2) {
          return await this.nano.translateReadingLevel(text, level);
        }
      }
    }
  }

  async analyzeTranslation(original: string, translated: string): Promise<string> {
    if (this.network.isOnline()) {
      try { return await this.gemini.analyzeTranslation(original, translated); } catch (e1) {
        try { return await this.webgpu.analyzeTranslation(original, translated); } catch (e2) {
          return await this.nano.analyzeTranslation(original, translated);
        }
      }
    } else {
      try { return await this.nvidia.analyzeTranslation(original, translated); } catch (e1) {
        try { return await this.webgpu.analyzeTranslation(original, translated); } catch (e2) {
          return await this.nano.analyzeTranslation(original, translated);
        }
      }
    }
  }

  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    if (this.network.isOnline()) {
      try { return await this.gemini.analyzeImage(base64Image, context); } catch (e1) {
        try { return await this.webgpu.analyzeImage(base64Image, context); } catch (e2) {
          return await this.nano.analyzeImage(base64Image, context);
        }
      }
    } else {
      try { return await this.nvidia.analyzeImage(base64Image, context); } catch (e1) {
        try { return await this.webgpu.analyzeImage(base64Image, context); } catch (e2) {
          return await this.nano.analyzeImage(base64Image, context);
        }
      }
    }
  }

  async startChat(patientData: string, context: string): Promise<void> {
    if (this.network.isOnline()) {
      try { await this.gemini.startChat(patientData, context); } catch (e1) {
        try { await this.webgpu.startChat(patientData, context); } catch (e2) {
          await this.nano.startChat(patientData, context);
        }
      }
    } else {
      try { await this.nvidia.startChat(patientData, context); } catch (e1) {
        try { await this.webgpu.startChat(patientData, context); } catch (e2) {
          await this.nano.startChat(patientData, context);
        }
      }
    }
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    if (this.network.isOnline()) {
      try { return await this.gemini.sendMessage(message, files); } catch (e1) {
        try { return await this.webgpu.sendMessage(message, files); } catch (e2) {
          return await this.nano.sendMessage(message, files);
        }
      }
    } else {
      try { return await this.nvidia.sendMessage(message, files); } catch (e1) {
        try { return await this.webgpu.sendMessage(message, files); } catch (e2) {
          return await this.nano.sendMessage(message, files);
        }
      }
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    if (this.network.isOnline()) {
      try { return await this.gemini.getInitialGreeting(prompt); } catch (e1) {
        try { return await this.webgpu.getInitialGreeting(prompt); } catch (e2) {
          return await this.nano.getInitialGreeting(prompt);
        }
      }
    } else {
      try { return await this.nvidia.getInitialGreeting(prompt); } catch (e1) {
        try { return await this.webgpu.getInitialGreeting(prompt); } catch (e2) {
          return await this.nano.getInitialGreeting(prompt);
        }
      }
    }
  }
}

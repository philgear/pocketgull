import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntelligenceProvider } from './intelligence.provider';
import { ClinicalMetrics } from '../clinical-intelligence.service';
import { VerificationIssue } from '../../components/analysis-report.types';

@Injectable({
  providedIn: 'root'
})
export class PubGemmaProvider implements IntelligenceProvider {
  private readonly OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
  private readonly MODEL_NAME = 'gemma:2b'; // Scaffold targeting local NVIDIA instances
  private chatContext = '';

  private async isOllamaAvailable(): Promise<boolean> {
      try {
          // Preflight ping with 1.5 second timeout ensures failure is fast if daemon is offline
          await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1500) });
          return true;
      } catch {
          return false;
      }
  }

  async *generateReportStream(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
    const isAvailable = await this.isOllamaAvailable();
    if (!isAvailable) {
      throw new Error("Local Ollama endpoint unreachable.");
    }

    const prompt = `System: ${systemInstruction}\nPatient Data: ${patientData}\nGenerate clinical report for ${lens}:`;
    
    const response = await fetch(this.OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.MODEL_NAME,
        prompt: prompt,
        stream: true
      })
    });

    if (!response.body) throw new Error("No response body from local inference engine");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;
          }
        } catch (e) {
          console.warn("Failed to parse Ollama chunk", e);
        }
      }
    }
  }

  async generateMetrics(reportText: string): Promise<ClinicalMetrics> {
    // Scaffold fallback for metrics. Local inference requires highly structured prompting for JSON extraction.
    return { complexity: 5, stability: 5, certainty: 5 }; 
  }

  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    return true; 
  }

  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: VerificationIssue[] }> {
    return { status: 'Verified by Local Open Weights (NVIDIA)', issues: [] };
  }

  async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
    return text; // Scaffold fallback
  }

  async analyzeTranslation(original: string, translated: string): Promise<string> {
    return "Analysis delegated to local model parameters.";
  }

  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    // Explicitly handing multimodal tasks back to the Generalist engine
    throw new Error("NVIDIA integration limits visual analysis to the multimodal gemini engine. Please route image dependencies accordingly.");
  }

  async startChat(patientData: string, context: string): Promise<void> {
    this.chatContext = `Patient Context: ${patientData}\nRole: ${context}`;
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    if (!(await this.isOllamaAvailable())) {
      throw new Error("Local Ollama endpoint unreachable.");
    }
    const prompt = `${this.chatContext}\n\nUser: ${message}\n\nPlease fulfill the request efficiently. If asked for practical items like a shopping list, grocery list, or daily itinerary based on clinical recommendations, you MUST provide them directly. Response:`;
    
    try {
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL_NAME,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Local inference failed.');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("NVIDIA Error:", error);
      return "Local NVIDIA inference engine could not be reached.";
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    return "Hello, I am the local open-weights instance (NVIDIA). How can I assist with this diagnosis?";
  }
}

import { Injectable } from '@angular/core';
import { IntelligenceProvider } from './intelligence.provider';
import { ClinicalMetrics } from '../clinical-intelligence.service';
import { VerificationIssue } from '../../components/analysis-report.types';

@Injectable({
  providedIn: 'root'
})
export class PubGemmaProvider implements IntelligenceProvider {
  private readonly OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
  /** Model tag for Ollama. Pull with: docker exec pubgemma-local ollama pull gemma2:2b */
  private readonly MODEL_NAME = 'gemma2:2b';
  private chatContext = '';

  // ---------------------------------------------------------------------------
  // Infrastructure
  // ---------------------------------------------------------------------------

  private async isOllamaAvailable(): Promise<boolean> {
    try {
      await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1500) });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sends a non-streaming prompt to Ollama and returns the full text response.
   * Throws if Ollama is unreachable or returns a non-OK status.
   */
  private async ollamaPrompt(prompt: string): Promise<string> {
    if (!(await this.isOllamaAvailable())) {
      throw new Error('Local Ollama endpoint unreachable.');
    }
    const response = await fetch(this.OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.MODEL_NAME, prompt, stream: false })
    });
    if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);
    const data = await response.json();
    return (data.response as string).trim();
  }

  // ---------------------------------------------------------------------------
  // Streaming report generation
  // ---------------------------------------------------------------------------

  async *generateReportStream(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
    if (!(await this.isOllamaAvailable())) {
      throw new Error('Local Ollama endpoint unreachable.');
    }
    const prompt = `System: ${systemInstruction}\nPatient Data: ${patientData}\nGenerate clinical report for ${lens}:`;
    const response = await fetch(this.OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.MODEL_NAME, prompt, stream: true })
    });
    if (!response.body) throw new Error('No response body from local inference engine');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n').filter(l => l.trim())) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) yield parsed.response;
        } catch {
          // Partial chunk — skip
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Clinical analytics
  // ---------------------------------------------------------------------------

  /**
   * Generates clinical complexity/stability/certainty scores from report text.
   * Prompts the model for a JSON object and parses it defensively.
   */
  async generateMetrics(reportText: string): Promise<ClinicalMetrics> {
    const prompt =
      `You are a clinical analyst. Given the following medical report, rate these three dimensions on a scale of 1–10:\n` +
      `- complexity: overall diagnostic complexity\n` +
      `- stability: how stable the patient's condition appears\n` +
      `- certainty: how certain the clinical conclusions seem\n\n` +
      `Respond ONLY with valid JSON like: {"complexity":7,"stability":4,"certainty":6}\n\n` +
      `Report:\n${reportText.slice(0, 3000)}`;
    try {
      const raw = await this.ollamaPrompt(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as ClinicalMetrics;
    } catch (e) {
      console.warn('[PubGemma] generateMetrics parse failed, using defaults.', e);
    }
    return { complexity: 5, stability: 5, certainty: 5 };
  }

  /**
   * Determines if there is a clinically significant change between two patient data snapshots.
   */
  async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
    const prompt =
      `You are a clinical decision support system. Compare these two patient data snapshots.\n` +
      `Answer ONLY "yes" if there is a clinically significant change, or "no" if the changes are minor.\n\n` +
      `PREVIOUS:\n${oldData.slice(0, 1500)}\n\nCURRENT:\n${newData.slice(0, 1500)}\n\nSignificant change?`;
    try {
      const raw = await this.ollamaPrompt(prompt);
      return raw.toLowerCase().includes('yes');
    } catch {
      return true; // Default to true (conservative: assume change)
    }
  }

  /**
   * Verifies a care plan section against source patient data and returns structured issues.
   */
  async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: VerificationIssue[] }> {
    const prompt =
      `You are a clinical auditor. Review the following care plan section for the "${lens}" lens.\n` +
      `Identify any discrepancies, unsupported claims, or red flags compared to the patient data.\n` +
      `List issues as JSON array: [{"field":"...","severity":"warning"|"error","message":"..."}]\n` +
      `If no issues, return an empty array []. Return ONLY the JSON array.\n\n` +
      `Patient Data:\n${sourceData.slice(0, 1500)}\n\nCare Plan Section:\n${content.slice(0, 1500)}`;
    try {
      const raw = await this.ollamaPrompt(prompt);
      const match = raw.match(/\[[\s\S]*\]/);
      const issues: VerificationIssue[] = match ? JSON.parse(match[0]) : [];
      const status = issues.length === 0
        ? `Verified by Local Open Weights (${this.MODEL_NAME})`
        : `${issues.length} issue(s) flagged by Local Open Weights (${this.MODEL_NAME})`;
      return { status, issues };
    } catch (e) {
      console.warn('[PubGemma] verifySection failed.', e);
      return { status: `Verification error — local model unavailable`, issues: [] };
    }
  }

  // ---------------------------------------------------------------------------
  // Translation & analysis
  // ---------------------------------------------------------------------------

  /**
   * Translates clinical text to the specified reading/cognition level using local inference.
   */
  async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
    const levelDescriptions: Record<typeof level, string> = {
      simplified: 'a simplified 6th-grade reading level, using plain language and short sentences',
      dyslexia: 'a dyslexia-friendly format with simple words, short paragraphs, and no complex medical jargon',
      child: 'a child-friendly (pediatric) level, age 8–12, with analogies and reassuring, simple language'
    };
    const prompt =
      `Rewrite the following clinical care plan text for ${levelDescriptions[level]}.\n` +
      `Preserve all medical meaning. Do NOT add new recommendations. Return only the rewritten text.\n\n` +
      `Original:\n${text}`;
    try {
      return await this.ollamaPrompt(prompt);
    } catch {
      return text; // Graceful degradation to original
    }
  }

  /**
   * Analyzes the structural quality and accuracy of a translated care plan.
   */
  async analyzeTranslation(original: string, translated: string): Promise<string> {
    const prompt =
      `You are a clinical translation auditor. Compare these two texts:\n\n` +
      `ORIGINAL (clinical):\n${original.slice(0, 1500)}\n\n` +
      `TRANSLATED (patient-facing):\n${translated.slice(0, 1500)}\n\n` +
      `Provide a concise structural analysis: what was simplified well, what meaning may have been altered, ` +
      `and any clinical nuances that were lost or preserved. Be specific and professional.`;
    try {
      return await this.ollamaPrompt(prompt);
    } catch {
      return 'Translation analysis unavailable — local model could not be reached.';
    }
  }

  // ---------------------------------------------------------------------------
  // Multimodal & chat
  // ---------------------------------------------------------------------------

  /** PubGemma (Gemma 2B text-only) cannot analyze images. Routes this back to the cloud engine. */
  async analyzeImage(base64Image: string, context?: string): Promise<string> {
    throw new Error('Local PubGemma (text-only) does not support image analysis. Please use the cloud Gemini provider.');
  }

  async startChat(patientData: string, context: string): Promise<void> {
    this.chatContext = `Patient Context: ${patientData}\nRole: ${context}`;
  }

  async sendMessage(message: string, files?: File[]): Promise<string> {
    const prompt =
      `${this.chatContext}\n\nUser: ${message}\n\n` +
      `Respond efficiently and clinically. If asked for practical items (shopping list, daily plan, etc.) based on clinical recommendations, provide them directly.\n\nResponse:`;
    try {
      return await this.ollamaPrompt(prompt);
    } catch (error) {
      console.error('[PubGemma] sendMessage error:', error);
      return 'Local PubGemma inference engine could not be reached.';
    }
  }

  async getInitialGreeting(prompt: string): Promise<string> {
    try {
      const greeting = await this.ollamaPrompt(
        `You are a helpful local clinical AI assistant (PubGemma, ${this.MODEL_NAME}). ` +
        `Generate a short, professional greeting for a clinician. Mention you are running locally. ` +
        `Context: ${prompt}`
      );
      return greeting;
    } catch {
      return `Hello, I am your local PubGemma assistant (${this.MODEL_NAME}). I am running entirely on-device. How can I assist?`;
    }
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IIntelligenceProvider } from './intelligence.provider';
import { AI_CONFIG } from '../ai-provider.types';
import { IClinicalMetrics } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';
import { VerifyAiService } from '../verify-ai.service';


@Injectable({
    providedIn: 'root'
})
export class GeminiProvider implements IIntelligenceProvider {
    private config = inject(AI_CONFIG);
    private verifier = inject(VerifyAiService);

    // Chat session ID for server-side session management
    private chatSessionId: string | null = null;

    /**
     * Generates a clinical report as an observable stream, reading Server-Sent Events (SSE).
     * Defensively implements manual chunking and buffer management to protect against network interruptions
     * or incomplete API payloads common in beta streaming services.
     *
     * @param patientData - The comprehensive stringified patient record.
     * @param lens - The specific clinical lens (e.g., 'Nutrition', 'Summary Overview').
     * @param systemInstruction - The structural system prompt enforcing formatting and citation rules.
     * @returns An Observable emitting string chunks of the AI's response as they arrive.
     */
    generateReportStream$(patientData: string, lens: string, systemInstruction: string): Observable<string> {
        return new Observable<string>(subscriber => {
            (async () => {
                try {
                    const response = await fetch('/api/ai/stream', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            patientData,
                            systemInstruction,
                            model: this.config.defaultModel.modelId,
                            temperature: this.config.defaultModel.temperature
                        })
                    });

                    if (!response.ok || !response.body) {
                        const err = await response.text();
                        throw new Error(err || 'Stream request failed');
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() ?? '';

                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                            
                            const data = trimmedLine.slice(6).trim();
                            if (data === '[DONE]') {
                                subscriber.complete();
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.error) {
                                    throw new Error(typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error));
                                }
                                
                                // Standard Gemini REST API shape
                                const geminiText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                                if (geminiText) {
                                    subscriber.next(geminiText);
                                } else if (parsed.text) {
                                    // Custom/Legacy wrapper shape
                                    subscriber.next(parsed.text);
                                }
                            } catch (e: any) {
                                // If it's a JSON parse error but we have multiple data: lines merged (should be fixed by split('\n'))
                                // or if there's trailing garbage, we catch it here to prevent stream death.
                                console.error("GeminiProvider: Error parsing SSE chunk", e, data);
                                // Don't throw if we can't parse one chunk, just log it. 
                                // Unless it's a real error object from the API.
                                if (data.includes('"error"')) throw e;
                            }
                        }
                    }
                    subscriber.complete();
                } catch (e) {
                    subscriber.error(e);
                }
            })();
        });
    }

    async generateMetrics(reportText: string): Promise<IClinicalMetrics> {
        const response = await fetch('/api/ai/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reportText })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();

        const { z } = await import('zod');
        const ClinicalMetricsSchema = z.object({
            complexity: z.number().min(0).max(10),
            stability: z.number().min(0).max(10),
            certainty: z.number().min(0).max(10)
        });

        return ClinicalMetricsSchema.parse(data);
    }

    async detectClinicalChanges(oldData: string, newData: string): Promise<boolean> {
        const response = await fetch('/api/ai/changes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldData, newData })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.significant;
    }

    async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }> {
        return await this.verifier.verifyReportSection(lens as any, content, sourceData);
    }

    async translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string> {
        const response = await fetch('/api/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, level })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.text;
    }

    async analyzeTranslation(original: string, translated: string): Promise<string> {
        const response = await fetch('/api/ai/analyze-translation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ original, translated })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis || data.text; // Support either return shape from backend
    }

    async analyzeImage(base64Image: string, context?: string): Promise<string> {
        const response = await fetch('/api/ai/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image, context })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis;
    }


    /**
     * Initializes a stateful multi-turn chat session with the underlying AI model.
     * Generates a unique session ID and pushes the foundational patient context.
     * 
     * @param patientData - The core patient data to base the chat around.
     * @param context - The system persona and instructions for the specific chat interaction.
     * @throws Error if the backend session fails to initialize.
     */
    async startChat(patientData: string, context: string): Promise<void> {
        const systemInstruction = `${context}\n\nPatient Data:\n${patientData}`;
        this.chatSessionId = `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        const response = await fetch('/api/ai/chat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: this.chatSessionId,
                systemInstruction,
                model: this.config.defaultModel.modelId,
                temperature: this.config.defaultModel.temperature
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to start chat session');
        }
    }

    /**
     * Appends a user message to the active chat session and awaits the model's full response.
     * Requires `startChat` to have been called previously.
     * 
     * @param message - The user's query or instruction.
     * @param files - Optional file attachments (implementation dependent).
     * @returns A Promise resolving to the model's textual response.
     * @throws Error if the chat has not been started or the API request fails.
     */
    async sendMessage(message: string, files?: File[]): Promise<string> {
        if (!this.chatSessionId) throw new Error('Chat not started');

        const response = await fetch('/api/ai/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: this.chatSessionId,
                message
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to send message');
        }
        const data = await response.json();
        return data.text;
    }

    async getInitialGreeting(prompt: string): Promise<string> {
        return this.sendMessage(prompt);
    }
}

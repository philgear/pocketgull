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

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (typeof window !== 'undefined') {
            const userKey = window.localStorage?.getItem('GEMINI_API_KEY') || (window as any).GEMINI_API_KEY;
            if (userKey) {
                headers['X-Gemini-API-Key'] = userKey.trim();
            }
        }
        return headers;
    }

    async *generateReportStream$(patientData: string, lens: string, systemInstruction: string): AsyncIterable<string> {
        // Hybrid Routing Strategy:
        // Use gemini-2.5-pro for heavy reasoning/synthesis lenses,
        // and gemini-2.5-flash for formatting/educational/structured lenses.
        const routingModelId = (lens === 'Summary Overview' || lens === 'Functional Protocols')
            ? 'gemini-2.5-pro'
            : 'gemini-2.5-flash';

        const response = await fetch('/api/ai/stream', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                patientData,
                systemInstruction,
                model: routingModelId,
                temperature: this.config.defaultModel.temperature,
                lens: lens
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
                    return;
                }
                
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        throw new Error(typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error));
                    }
                    
                    const geminiText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (geminiText) {
                        yield geminiText;
                    } else if (parsed.toolCall) {
                        yield `__TOOL_CALL__:${JSON.stringify(parsed.toolCall)}`;
                    } else if (parsed.text) {
                        // Custom/Legacy wrapper shape
                        yield parsed.text;
                    }
                } catch (e: any) {
                    console.error("GeminiProvider: Error parsing SSE chunk", e, data);
                    if (data.includes('"error"')) throw e;
                }
            }
        }
    }

    async generateMetrics(reportText: string): Promise<IClinicalMetrics> {
        const response = await fetch('/api/ai/metrics', {
            method: 'POST',
            headers: this.getHeaders(),
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
            headers: this.getHeaders(),
            body: JSON.stringify({ oldData, newData })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.significant;
    }

    async verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }> {
        return await this.verifier.verifyReportSection(lens as any, content, sourceData);
    }

    async translateReadingLevel(
        text: string,
        level?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'mandarin' | 'hindi',
        cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child',
        language?: string
    ): Promise<string> {
        const response = await fetch('/api/ai/translate', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ text, level, cognitiveLevel, language })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.text;
    }

    async analyzeTranslation(original: string, translated: string): Promise<string> {
        const response = await fetch('/api/ai/analyze-translation', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ original, translated })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis || data.text; // Support either return shape from backend
    }

    async analyzeImage(base64Image: string, context?: string): Promise<string> {
        const response = await fetch('/api/ai/analyze-image', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ base64Image, context })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.analysis;
    }

    async synthesizeKnowledge(inputText: string): Promise<any> {
        const response = await fetch('/api/ai/synthesize', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ text: inputText })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data;
    }

    async startChat(patientData: string, context: string): Promise<void> {
        const systemInstruction = `${context}\n\nPatient Data:\n${patientData}`;
        const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2);
        this.chatSessionId = `chat_${Date.now()}_${randomPart}`;

        const response = await fetch('/api/ai/chat/start', {
            method: 'POST',
            headers: this.getHeaders(),
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

    async sendMessage(message: string, files?: File[], enableGrounding?: boolean): Promise<string> {
        if (!this.chatSessionId) throw new Error('Chat not started');

        const encodedFiles = await Promise.all((files || []).map(async f => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ name: f.name, type: f.type, data: (e.target?.result as string).split(',')[1] });
                reader.readAsDataURL(f);
            });
        }));

        const response = await fetch('/api/ai/chat/message', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                sessionId: this.chatSessionId,
                message,
                files: encodedFiles,
                enableGrounding
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

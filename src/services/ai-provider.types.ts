import { InjectionToken } from '@angular/core';

export type AiModelId =
    | 'gemini-2.5-flash'
    | 'gemini-2.5-pro';

export interface IAiModelConfig {
    modelId: AiModelId;
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
}

export interface IAiProviderConfig {
    apiKey: string;
    defaultModel: IAiModelConfig;
    verificationModel: IAiModelConfig;
}

export const AI_CONFIG = new InjectionToken<IAiProviderConfig>('AI_CONFIG');

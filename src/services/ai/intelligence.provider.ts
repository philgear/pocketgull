import { Observable } from 'rxjs';
import { IClinicalMetrics, ITranscriptEntry } from '../clinical-intelligence.service';
import { IVerificationIssue } from '../../components/analysis-report.types';

export interface IReportGenerationResult {
    lens: string;
    text: string;
    isComplete: boolean;
}

export interface IIntelligenceProvider {
    /**
     * Generates a clinical report for a specific lens.
     * Supports streaming via Observable.
     */
    generateReportStream$(patientData: string, lens: string, systemInstruction: string): Observable<string>;

    /**
     * Generates clinical metrics (complexity, stability, certainty) for a report.
     */
    generateMetrics(reportText: string): Promise<IClinicalMetrics>;

    /**
     * Detects if changes between two clinical snapshots are clinically significant.
     */
    detectClinicalChanges(oldData: string, newData: string): Promise<boolean>;

    /**
     * Clinical verification layer to cross-reference AI output with source data.
     */
    verifySection(lens: string, content: string, sourceData: string): Promise<{ status: string, issues: IVerificationIssue[] }>;

    /**
     * Translates clinical text to a specific reading, cognition, or philosophical level.
     */
    translateReadingLevel(text: string, level: 'simplified' | 'dyslexia' | 'child'): Promise<string>;

    /**
     * Analyzes translation accuracy and tone.
     */
    analyzeTranslation(original: string, translated: string): Promise<string>;

    /**
     * Analyzes a medical image (base64) using multi-modal AI.
     */
    analyzeImage(base64Image: string, context?: string): Promise<string>;


    /**
     * Chat Session Management
     */
    startChat(patientData: string, context: string): Promise<void>;
    sendMessage(message: string, files?: File[]): Promise<string>;
    getInitialGreeting(prompt: string): Promise<string>;
}

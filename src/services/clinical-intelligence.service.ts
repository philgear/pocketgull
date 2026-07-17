import { Injectable, signal, inject } from '@angular/core';
import { IIntelligenceProvider } from './ai/intelligence.provider';
import { AiCacheService } from './ai-cache.service';
import { IVerificationIssue } from '../components/analysis-report.types';
import { AI_CONFIG } from './ai-provider.types';
import { IntelligenceProviderToken } from './ai/intelligence.provider.token';
import { NetworkStateService } from './network-state.service';
import { RulesEngineService } from './rules-engine.service';
import { PatientStateService } from './patient-state.service';
import { OrcidService } from './orcid.service';
import { WebLLMProvider } from './ai/webllm.provider';
import {
    DEMO_ANALYSIS_REPORT_WESTERN,
    DEMO_ANALYSIS_REPORT_EASTERN,
    DEMO_ANALYSIS_REPORT_AYURVEDIC
} from '../demo-data';

export interface ITranscriptEntry {
    role: 'user' | 'model';
    text: string;
}

export interface INodeContext {
    nodeText: string;
    sectionTitle: string;
    transcript: ITranscriptEntry[];
    timestamp: Date;
}

export type AnalysisLens = 'Summary Overview' | 'Functional Protocols' | 'Nutrition' | 'Monitoring & Follow-up' | 'Patient Education' | 'Precision Nutrients';

export interface IClinicalMetrics {
    complexity: number; // 0-10
    stability: number;  // 0-10
    certainty: number;  // 0-10
}

@Injectable({
    providedIn: 'root'
})
export class ClinicalIntelligenceService {
    readonly ai = inject(IntelligenceProviderToken);
    private cache = inject(AiCacheService);
    private network = inject(NetworkStateService);
    private rules = inject(RulesEngineService);
    private patientState = inject(PatientStateService);
    private orcid = inject(OrcidService);
    private webgpu = inject(WebLLMProvider);

    readonly isLoading = signal<boolean>(false);
    readonly webgpuProgress = this.webgpu.loadingProgress;
    readonly webgpuIsLoading = this.webgpu.isLoadingProgress;
    readonly error = signal<string | null>(null);

    // Store analysis reports for each lens
    readonly analysisResults = signal<Partial<Record<AnalysisLens, string>>>({});
    readonly analysisMetrics = signal<IClinicalMetrics | null>(null);
    readonly verificationResults = signal<Partial<Record<AnalysisLens, { status: string, issues: IVerificationIssue[] }>>>({});
    readonly lastRefreshTime = signal<Date | null>(null);

    // For live agent chat
    readonly transcript = signal<ITranscriptEntry[]>([]);
    readonly researchHits = signal<any[] | null>(null);

    readonly recentNodes = signal<INodeContext[]>([]);

    readonly lastActivePhilosophy = signal<'western' | 'eastern' | 'ayurvedic' | null>(null);
    readonly lastPatientData = signal<string | null>(null);

    /**
     * Maps each diagnostic lens to its Gull Squadron persona.
     * @see DESIGN.md §7 — Avian Personas
     */
    public getAgentNameForLens(lens: AnalysisLens): string {
        switch (lens) {
            case 'Summary Overview':
                return 'Gulliver';
            case 'Functional Protocols':
            case 'Nutrition':
            case 'Precision Nutrients':
                return 'Swoop';
            case 'Monitoring & Follow-up':
                return 'Sentinel';
            case 'Patient Education':
                return 'Scribes';
            default:
                return 'Gulliver';
        }
    }

    /**
     * Returns the role description for each Gull Squadron member.
     * @see DESIGN.md §7.1 — The Four Diagnostic Agents
     */
    public getAgentRoleForLens(lens: AnalysisLens): string {
        switch (lens) {
            case 'Summary Overview':
                return 'Overview & Chart Synthesis Expert — "I see the whole ocean from up here."';
            case 'Functional Protocols':
            case 'Nutrition':
            case 'Precision Nutrients':
                return 'Interventions & Precision Dosing Specialist — "Spotted. Locked. Delivering."';
            case 'Monitoring & Follow-up':
                return 'Recovery Vigilance & Trend Monitor — "I never blink. I never look away."';
            case 'Patient Education':
                return 'Patient Translation & Education Specialist — "Let me explain that in a way that actually helps."';
            default:
                return 'Clinical Co-Pilot';
        }
    }

    public addRecentNode(nodeContext: INodeContext) {
        this.recentNodes.update(nodes => {
            // Keep only the last 3 most recent nodes to prevent context bloat
            const next = [nodeContext, ...nodes];
            if (next.length > 3) return next.slice(0, 3);
            return next;
        });
    }

    private readonly FORMATTING_RULES = `

FORMATTING RULES (you MUST follow these exactly):
- Use ONLY ### level headings. Never use # or ##.
- Keep paragraphs to 2–3 sentences maximum. Be concise and clinical.
- Use **bold** for key clinical terms. Never use ALL CAPS.
- Prefer bullet lists over numbered lists unless ordering matters clinically.
- Use markdown tables for structured data (labs, dosing, schedules, vitals).
- Never output raw URLs.
- Do NOT repeat the patient data back — synthesize and advise.
- Write in third person clinical voice ("The patient presents with..." not "You have...").
- CITATION INTEGRITY (UKRIO): When referencing medical literature, you MUST use a parenthetical citation [Author et al., Year].
- ACCURACY: Only cite a source if it directly supports the specific clinical claim being made. DO NOT use research sources to support patient-reported symptoms unless the source provides specific diagnostic criteria or evidence matched to those symptoms.
- TRANSPARENCY: Include the full reference in the 'References' section. Use DOIs whenever available. If a source is peer-reviewed, state this clearly in the reference.
- NO HALLUCINATION: Only cite sources provided in the "Research Context" or "Bookmarks" sections. If no provided source supports a claim, do NOT cite anything.
- WHO GUIDELINE ALIGNMENT: Recommendations, diagnostic thresholds (e.g. blood pressure, fasting blood glucose), and pharmacological strategies should align with official World Health Organization (WHO) clinical guidelines, protocols, and standard global health baselines.
- HIPAA PRIVACY COMPLIANCE: Never output hypothetical or real personally identifiable information (PII) such as full names, social security numbers, phone numbers, or physical addresses. Keep all outputs strictly restricted to de-identified clinical telemetry and anonymous diagnostics.

ANNOTATION SYNTAX (place on a NEW LINE after the relevant paragraph or list item, never inline):
[[suggestion: Short actionable suggestion]]
[[proposed: Full replacement text for the paragraph above]]
`;

    private readonly PHILOSOPHY_INSTRUCTIONS: Record<'western' | 'eastern' | 'ayurvedic', string> = {
        western: `CLINICAL PARADIGM: Western (Allopathic) Medicine.
- Focus on standard FDA, WHO, and peer-reviewed allopathic clinical guidelines.
- Target conventional pharmacology, evidence-based diagnostics, standard metabolic pathways, and structured healthcare interventions.
- Ensure recommendations are backed by randomized controlled trials (RCTs) and clinical reference models.`,

        eastern: `CLINICAL PARADIGM: Eastern (Traditional Chinese Medicine - TCM).
- FRAME WORK & 8 PRINCIPLES: Frame the clinical assessment and care plan using TCM diagnostic paradigms: identify Zang-Fu organ system imbalances and categorize them according to the Eight Principles (Yin/Yang, Interior/Exterior, Cold/Heat, Deficiency/Excess).
- ZANG-FU PATTERN ANALYSIS: Detail specific Zang-Fu organ disharmonies relevant to the patient's symptoms (e.g., Liver Qi Stagnation for stress/pain, Spleen Qi Deficiency for fatigue/digestive issues, Kidney Yin or Yang Deficiency for chronic vitality depletion, Lung Qi Deficiency for respiratory weakness).
- WU XING (FIVE ELEMENTS) DYNAMICS: Utilize Five Elements theory to analyze generating (Sheng) and controlling (Ke) relationships (e.g., Wood overacting on Earth causing Liver-Spleen disharmony, or Earth failing to generate Metal).
- MERIDIANS & CLINICAL ACUPOINTS: Suggest targeted stimulation of specific acupoints and meridians to restore homeostasis:
  * ST36 (Zusanli) for Spleen/Stomach tonification, digestive health, and building Wei Qi.
  * LI4 (Hegu) and LV3 (Taichong) in combination (the "Four Gates") to circulate Qi and blood, relieve pain, and alleviate stagnation.
  * SP6 (Sanyinjiao) to nourish Yin and Blood, regulate the Kidney/Liver/Spleen channels.
  * Du 20 (Baihui) for raising Yang Qi and calming the Shen.
- TONGUE & PULSE DIAGNOSTIC INDICATORS: Provide expected diagnostic markers (e.g., pale tongue with thin white coat indicating Qi/Blood deficiency; red body with yellow greasy coat indicating Damp-Heat; Pulse qualities like Wiry [Xian] indicating Liver disharmony or pain, Slippery [Hua] indicating Dampness/Phlegm, or Weak/Thready [Xi/Ruo] indicating deficiency).
- THERAPEUTIC MODALITIES: Integrate personalized lifestyle, nutrition, and therapies: acupressure, meridian therapy, moxibustion guidelines, and traditional herbal formulations (categorized by energetic temperatures: cooling vs. warming foods, Yin-nourishing vs. Yang-tonifying herbs).
- LINK BIOCHEMISTRY TO TRADITIONAL ORGAN CHANNELS: Connect Western biomarker trends and minerals directly to Meridian/Zang-Fu systems:
  * Map Zinc and Vitamin D3 to Kidney Essence (Jing) and Yang Vitality.
  * Map Magnesium to Liver/Heart Qi regulation and smoothing Qi flow.
  * Map Vitamin B12, Iron, and Folate to Spleen Qi and Blood generation (Spleen's function of transformation and transportation).
  * Map Vitamin C and antioxidants to Lung Qi and the strength of Wei Qi (protective exterior).
- MODERN PHYSIOLOGICAL TRANSLATION: Always translate these traditional concepts into clean clinical contexts that blend with modern physiological understanding (e.g., referencing autonomic nervous system regulation, hypothalamic-pituitary-adrenal (HPA) axis balance, and microcirculation alongside Qi and blood stasis).`,

        ayurvedic: `CLINICAL PARADIGM: Ayurvedic Medicine.
- FRAMEWORK & 3 DOSHAS: Frame the clinical assessment and care plan using Ayurvedic diagnostic paradigms: evaluate the patient's likely Tridosha constitution (Prakriti) and current imbalances (Vikriti - Vata, Pitta, Kapha).
- METABOLISM, TOXICITY & DIGESTIVE FIRE: Analyze cellular health through the concepts of Agni (digestive and metabolic fire: Sama, Vishama, Tikshna, Manda) and Ama (accumulated toxic residue: Sama vs. Nirama status).
- DHATUS (7 TISSUE LAYERS) PENETRATION: Map pathology and symptoms to affected Dhatus:
  * Rasa (Plasma/Lymph): Dry skin, fatigue, lymphatic congestion.
  * Rakta (Blood/Oxygenation): Rashes, inflammation, blood pressure.
  * Mamsa (Muscle): Muscle pain, spasms, wasting.
  * Medas (Fat/Adipose): Metabolic and weight issues.
  * Asthi (Bone/Cartilage): Skeletal/joint issues, bone density.
  * Majja (Nervous/Marrow): Neuropathic pain, sleep/anxiety, nervous system.
  * Shukra (Reproductive/Vitality): Hormonal and vigor depletion.
- SROTAS (PHYSIOLOGICAL CHANNELS): Identify compromised channels and blockages (Srotas dusti), e.g., Pranavaha (Respiratory), Annavaha (Digestive), Rasavaha (Plasma), Raktavaha (Circulatory), Asthivaha (Skeletal), Majjavaha (Nervous).
- TONGUE & PULSE DIAGNOSIS (JIHVA & NADI PARIKSHA):
  * Vata indicators: Rapid, irregular pulse (Nadi: Snake-like/Tarpana); thin, dry tongue with cracking.
  * Pitta indicators: Strong, bounding pulse (Nadi: Frog-like/Manduka); red tongue body, yellowish coat.
  * Kapha indicators: Slow, steady, deep pulse (Nadi: Swan-like/Hamsa); pale, swollen tongue with thick white coating (indicating high Ama).
- BOTANICAL-TO-BIOCHEMICAL TRANSLATION: Map traditional Ayurvedic Rasayanas to both their energetic qualities (Rasa/Taste, Virya/Potency, Vipaka/Post-digestive effect) and modern biochemical pathways:
  * Ashwagandha (Withania somnifera) -> Ushna Virya, Madhura Vipaka; mediates HPA-axis regulation, cortisol reduction, and GABAergic modulation.
  * Curcumin/Shallaki (Boswellia serrata) -> Tikta/Katu Rasa, Ushna Virya; inhibits 5-LOX, downregulates NF-kB, and reduces pro-inflammatory cytokines.
  * Triphala (Amalaki, Bibhitaki, Haritaki) -> Pancharasa (5 tastes), warm/neutral; stimulates short-chain fatty acid (SCFA) production, maintains gut barrier integrity, and optimizes microbiome diversity.
- LINK BIOCHEMISTRY TO DHATUS & OJAS: Map Western biomarker trends (minerals, vitamins) to Dhatus and Ojas:
  * Map Vitamin D3 and Calcium to Asthi Dhatu (bone tissue).
  * Map Iron, B12, and Folate to Rakta Dhatu (blood tissue).
  * Map Zinc and Magnesium to Majja Dhatu (nervous tissue).
  * Map general antioxidants and immune markers to Ojas replenishment.
- THERAPEUTIC REGIMEN (DINACHARYA): Detail circadian lifestyle alignment, including oil pulling (Gandusha), nasal therapy (Nasya), dry powder massage (Udvartana), and warm self-massage (Abhyanga), along with dietary guidelines based on the dominant Gunas (qualities).`
    };

    private systemInstructions: Record<AnalysisLens, string> = {
        'Summary Overview': `You are a world-class care plan recommendation engine for a clinical decision-support tool.

Analyze the patient overview and generate a **Visit Summary Overview** structured as follows:

### Clinical Assessment
A concise 2–3 sentence synthesis of the patient's current clinical picture — key diagnoses, functional status, and risk factors.

### Priority List
A bullet list of the top 3–5 clinical priorities, ordered by urgency. Each item should be **bold label**: brief rationale.

### Plan of Care
Actionable treatment steps organized by priority. Use sub-bullets for specifics (medication, dose, frequency). Include a markdown table if there are ≥3 medications or interventions to compare.

### Goals
Short-term (2 weeks) and long-term (3 months) measurable clinical goals as bullet points.

### References
A structured list of all sources cited in this report. Format: **Author(s)** (Year). *Title*. Publisher/Journal. DOI (as a clickable link if available). Indicate if Peer-Reviewed.
` + this.FORMATTING_RULES,

        'Functional Protocols': `You are an expert functional medicine strategist for a clinical decision-support tool, deeply inspired by the work of Linus Pauling (providing the right molecules in the right amounts).

Analyze the patient overview and recommend specific, evidence-based biochemical pathways and interventions structured as follows. CRITICAL: For pediatric patients, avoid generic "exercise" or exhaustive "supplement" routines. Instead, focus on parent-guided therapeutic environments, targeted food-as-medicine, and gentle metabolic support pathways.

### Immediate Actions (To start within 72 hours)
(List critical interventions to initiate immediately, focusing on environmental or dietary modifications first.)

### Functional Foundation (Diet, Environment & Lifestyle)
(Provide recommendations focusing on optimizing the cellular environment, nutrient-dense whole foods, sleep architecture, and toxin reduction.)

### Targeted Biochemical Support
(Generate a Markdown table with columns: Intervention/Molecule | Form/Dose | Delivery/Timing | Targeted Pathway. Use clinical precision rather than generic supplements.)

### Functional & Environmental Protocols
(Describe specific therapeutic protocols like "HPA Axis Support", "Histamine Reduction", or "Circadian Alignment" tailored appropriately, especially for children.)` + this.FORMATTING_RULES,

        'Nutrition': `You are an expert in clinical nutrition for a clinical decision-support tool.

Analyze the patient overview and telemetry with a strict focus on biochemical pathways, micronutrient deficiencies, and cellular health. Structure as follows:

### Biochemical Assessment
(2-3 sentences analyzing the patient's oxidative stress, antioxidant status, and micronutrient panel findings.)

### Nutrition Targets
(Bullet list of specific metabolic pathways or nutrient deficiencies to target, e.g., "**Vitamin C Deficit**: high oxidative load requires replenishment.")

### Nutritional Interventions
(Generate a Markdown table with columns: Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway. Focus on high-dose or targeted nutrient therapies.)

### Dietary Adjustments
(Crucial whole-food or specific dietary modifications to support the functional strategy.)` + this.FORMATTING_RULES,

        'Monitoring & Follow-up': `You are a care coordination AI for a clinical decision-support tool.

Generate a structured monitoring and follow-up plan organized by time horizon:

### Immediate Next Steps (0-30 days)
(Provide an ordered list of high-priority actions.)

### Ongoing (Month 1-3)
(Generate a markdown table of tracking parameters with columns: Parameter | Target | Frequency | Escalation Trigger. Only output the table in this section, do not include preamble.)

### Long-term Trajectory (6+ months)
(Provide a brief narrative on expected outcomes.)` + this.FORMATTING_RULES,

        'Patient Education': `You are a patient education specialist for a clinical decision-support tool. Translate the documented clinical findings into patient-friendly language.

CRITICAL: You must ONLY include information that is explicitly documented in the patient data provided. Do NOT invent, assume, or add any clinical details, recommendations, or advice not present in the source material. Every statement must be directly traceable to the provided data.

Generate clear, empathetic educational content in **plain language** (8th grade reading level). Structure as follows:

### Understanding Your Condition
2–3 sentence explanation of the patient's documented condition(s) using everyday language. ONLY reference diagnoses, symptoms, and findings that appear in the source data. Use everyday analogies where helpful.

### What Was Found
Bullet list summarizing ONLY the documented clinical findings, test results, and observations from the patient record. Each item: **Finding**: plain-language explanation of what it means. Do NOT add findings not in the source.

### Current Plan
Bullet list of ONLY the treatments, medications, or interventions that are explicitly documented or recommended in the other care plan sections. Each item: **Intervention**: plain-language explanation of why it was chosen. If no specific plan is documented, state "Your care team will discuss treatment options with you."

### Important Notes
> 💡 Summarize ONLY the specific precautions, follow-up instructions, or red flags that are documented in the source data. If none are documented, state "Discuss follow-up and precautions with your care team at your next visit."

If a section has no relevant source data, output the heading followed by: "*No specific information documented — please discuss with your care team.*"
` + this.FORMATTING_RULES,

        'Precision Nutrients': `You are an expert in Orthomolecular Medicine and functional psychiatry for a clinical decision-support tool.

Analyze the patient overview, specifically hunting for lab metrics, micronutrient imbalances, or symptom profiles that suggest underlying biochemical deficiencies (e.g., methylation cycle blocks, pyroluria, oxidative stress, heavy metal toxicity). Structure as follows:

### Biochemical & Biomarker Matrix
(2-3 sentences summarizing the patient's critical orthomolecular status based on the provided data.)

At the very end of the "Biochemical & Biomarker Matrix" section, you MUST output a structured JSON block containing the status of key biomarkers. Use EXACTLY the following JSON format inside a json code block:
\`\`\`json
[
  { "name": "Magnesium", "level": "Deficient", "pathway": "ATP Synthesis / NMDA" },
  { "name": "Vitamin D3", "level": "Sub-optimal", "pathway": "Immune / Bone" }
]
\`\`\`
Allowed names are: "Magnesium", "Vitamin D3", "Vitamin B12", "Folate (B9)", "Zinc", "Homocysteine", "Ferritin", "Vitamin C".
Allowed levels are: "Deficient", "Sub-optimal", "Optimal", "High", "Excess".
Provide a status for at least 3-4 biomarkers that are most relevant to the patient's data, labs, or symptoms.

### Detected Deficiencies
(Bullet list of specific nutrient depletions or metabolic blocks detected. If none are explicitly found, list "potential" deficiencies based strictly on the symptom profile.)

### Orthomolecular Protocol
(Generate a Markdown table with columns: Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway. Suggest specific, bioavailable forms (e.g., Methylcobalamin, P-5-P) rather than generic vitamins. Suggest IV therapies if appropriate.)

### Cautions & Interactions
(List any critical nutrient-drug interactions or contraindications for the suggested mega-doses based on the patient's pharmaceutical profile.)` + this.FORMATTING_RULES
    };

    public resetAIState() {
        this.isLoading.set(false);
        this.error.set(null);
        this.analysisResults.set({});
        this.analysisMetrics.set(null);
        this.transcript.set([]);
        this.lastActivePhilosophy.set(null);
    }

    public loadArchivedAnalysis(report: Partial<Record<AnalysisLens, string>>) {
        this.resetAIState();
        this.analysisResults.set(report);
        this.lastRefreshTime.set(new Date());
    }

    private async generateVisualMetrics(report: Record<string, string>): Promise<void> {
        const isEmergency = this.patientState.isEmergencyMode();
        if (isEmergency) {
            this.analysisMetrics.set({ complexity: 3, stability: 2, certainty: 8 });
            return;
        }

        const lenses: AnalysisLens[] = ['Summary Overview', 'Functional Protocols', 'Nutrition', 'Precision Nutrients', 'Monitoring & Follow-up', 'Patient Education'];
        const reportText = lenses.map(lens => report[lens]).filter(Boolean).join('\n\n');
        const cacheKey = await this.cache.generateKey([reportText, 'visual-metrics-v2']);

        try {
            const cached = await this.cache.get<IClinicalMetrics>(cacheKey);
            if (cached) {
                this.analysisMetrics.set(cached);
                return;
            }

            const validatedData = await this.ai.generateMetrics(reportText);

            const dataToCache = {
                metrics: validatedData,
                _timestamp: new Date().toISOString()
            };
            await this.cache.set(cacheKey, dataToCache);
            this.analysisMetrics.set(validatedData);
        } catch (e) {
            console.warn("Failed to generate visual metrics, using defaults", e);
            this.analysisMetrics.set({ complexity: 5, stability: 5, certainty: 5 });
        }
    }

    private getDemoReportForPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic'): Partial<Record<AnalysisLens, string>> {
        if (philosophy === 'eastern') return DEMO_ANALYSIS_REPORT_EASTERN;
        if (philosophy === 'ayurvedic') return DEMO_ANALYSIS_REPORT_AYURVEDIC;
        return DEMO_ANALYSIS_REPORT_WESTERN;
    }

    private getDemoMetricsForPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic'): IClinicalMetrics {
        if (philosophy === 'eastern') return { complexity: 7, stability: 6, certainty: 7 };
        if (philosophy === 'ayurvedic') return { complexity: 8, stability: 5, certainty: 7 };
        return { complexity: 6, stability: 7, certainty: 8 };
    }

    private generateDynamicMockReport(name: string, philosophy: 'western' | 'eastern' | 'ayurvedic'): Partial<Record<AnalysisLens, string>> {
        const age = this.patientState.patientAge();
        const gender = this.patientState.patientGender();
        const vitals = this.patientState.vitals();
        const goals = this.patientState.patientGoals() || 'Optimize general wellness and manage chronic symptoms.';
        
        // Flatten issues into a readable list
        const issuesMap = this.patientState.issues();
        const issueDescriptions: string[] = [];
        const issueNames: string[] = [];
        Object.values(issuesMap).forEach(list => {
            list.forEach(issue => {
                issueNames.push(issue.name);
                if (issue.description) {
                    issueDescriptions.push(`- **${issue.name}**: ${issue.description} (Pain Level: ${issue.painLevel}/10)`);
                }
            });
        });
        
        const issuesStr = issueDescriptions.length > 0 
            ? issueDescriptions.join('\n') 
            : '- **General Wellness**: No acute physical issues reported.';

        const vitalsStr = `BP: ${vitals.bp || '120/80'}, HR: ${vitals.hr || '72'} bpm, Temp: ${vitals.temp || '98.6°F'}, SpO2: ${vitals.spO2 || '98%'}`;

        if (philosophy === 'eastern') {
            const tcmPattern = issueNames.length > 0 
                ? `${issueNames.join('/')} presenting as Qi and Blood Stasis with underlying Qi Deficiency`
                : 'Mild Qi Deficiency and minor Shen disturbance';
            return {
                'Summary Overview': `### Clinical Assessment (TCM)
${name} is a ${age}-year-old ${gender.toLowerCase()} presenting with ${tcmPattern}. The primary goal is to restore meridian flow and strengthen Zang-Fu organ systems.

### Priority List
- **Qi & Blood Circulation**: Resolve stasis in affected channels.
- **Support Meridian Flow**: Harmonize energetic imbalances related to ${issueNames.join(', ') || 'general constitution'}.
- **Shen Stabilization**: Reduce systemic stress and calm the spirit.

### Plan of Care (TCM)
- **Acupuncture**: Target local Ashi points and distal points (e.g., LI4, LV3, ST36) to clear stagnation.
- **Herbal Therapy**: Consider customized formula (e.g., Xiao Yao San or Shen Tong Zhu Yu Tang) based on tongue and pulse.
- **Moxibustion**: Apply to warm channels if cold-damp pattern is present.

### Goals
- **Short-term (2 weeks)**: Stagnation-induced pain reduction. Improved sleep quality and Shen stability.
- **Long-term (3 months)**: Complete harmonization of Yin-Yang balance and restoration of normal Qi flow.`,

                'Functional Protocols': `### Lifestyle & Qi Gong
- **Tai Chi or Qi Gong**: 15 minutes daily to promote smooth flow of Liver Qi.
- **Acupressure self-stimulation**: Focus on LI4 and LV3 daily.
- **Warmth therapy**: Keep affected areas warm to prevent Cold-Damp invasion.`,

                'Nutrition': `### Dietary Recommendations (TCM)
- **Thermal Nature**: Emphasize warm and cooked foods; strictly avoid raw/cold foods which deplete Spleen Yang.
- **Flavors**: Moderate sweet (tonifying) and pungent (dispersing) foods.
- **Specific Foods**: Add ginger, garlic, scallions, and warm broths.`,

                'Precision Nutrients': `### Herb & Nutrient Matrix
- **Astragalus (Huang Qi)**: Tonify spleen and lung Qi.
- **Ginseng (Renshen)**: Rescues primal Qi.
- **Coenzyme Q10**: For cellular energy and heart Qi support.`,

                'Monitoring & Follow-up': `### Follow-up Protocol
- Re-evaluate tongue coating and pulse quality bi-weekly.
- Track pain severity trends.
- Assess stress levels (Shen stability) monthly.`,

                'Patient Education': `### Understanding Your Balance
Your symptoms stem from a temporary block in the flow of Qi (life energy) and Blood along the meridians. By warming the channels and dispersing stagnation, we aim to help your body heal itself.`
            };
        } else if (philosophy === 'ayurvedic') {
            const doshaImbalance = issueNames.length > 0 
                ? `Vata-Pitta imbalance with Ama (toxin) accumulation affecting the ${issueNames.join('/')} channels`
                : 'Mild Vata imbalance stemming from daily lifestyle stressors';
            return {
                'Summary Overview': `### Clinical Assessment (Ayurveda)
${name} is a ${age}-year-old ${gender.toLowerCase()} presenting with ${doshaImbalance}. The primary objective is to balance Doshas, kindle Agni (digestive fire), and eliminate Ama.

### Priority List
- **Pacify Vata/Pitta**: Calming nervous system activation and cooling systemic heat.
- **Kindle Agni**: Optimize digestion to prevent further Ama formation.
- **Srotas Cleansing**: Unblock metabolic and energy channels.

### Plan of Care (Ayurveda)
- **Abhyanga (Warm oil massage)**: Use sesame or coconut oil daily to pacify Vata.
- **Pranayama (Nadi Shodhana)**: Alternate nostril breathing 10 minutes daily for nervous system regulation.
- **Panchakarma (Detoxification)**: Consider mild home-based cleansing protocol.

### Goals
- **Short-term (2 weeks)**: Agni normalization and reduction of acute symptoms.
- **Long-term (3 months)**: Stable Dhatu (tissue) health and complete balance of Vata/Pitta/Kapha.`,

                'Functional Protocols': `### Daily Routine (Dinacharya)
- **Abhyanga**: Self-massage before bath.
- **Pranayama**: Daily alternate nostril breathing.
- **Sleep schedule**: Target bedtime by 10:00 PM (Kapha time).`,

                'Nutrition': `### Ayurvedic Diet
- **Dosha-specific**: Favor warm, moist, cooked foods. Use warming spices (cumin, coriander, turmeric).
- **Avoid**: Dry, cold, processed foods, and ice-cold water.
- **Hydration**: Warm water or herbal ginger tea throughout the day.`,

                'Precision Nutrients': `### Ayurvedic Rasayanas
- **Ashwagandha**: Pacify Vata, nourish Majja Dhatu, and support stress resilience.
- **Triphala**: Kindles Agni and supports daily detoxification.
- **Turmeric & Boswellia**: Anti-inflammatory support.`,

                'Monitoring & Follow-up': `### Clinical Monitoring
- Recheck pulse diagnosis (Nadi Pariksha) and tongue appearance.
- Monitor stool consistency (Agni indicator).
- Track sleep efficiency and energy levels.`,

                'Patient Education': `### Your Constitution & Balance
In Ayurveda, health is balance of the three energies: Vata (movement), Pitta (transformation), and Kapha (structure). We are calming Vata and clearing minor blockages to allow your life force (Prana) to flow freely.`
            };
        } else {
            // Western
            return {
                'Summary Overview': `### Clinical Assessment
${name} is a ${age}-year-old ${gender.toLowerCase()} presenting for management of active clinical concerns and functional optimization. 

### Current Presentation & Vitals
- **Vitals**: ${vitalsStr}
- **Active Concerns**:
${issuesStr}

### Clinical Priorities
- **Symptom Management**: Focus on non-pharmacological and targeted interventions for ${issueNames.join(', ') || 'general wellness'}.
- **Lifestyle Modification**: Circadian alignment, metabolic optimization, and targeted movement.
- **Patient Goals**: ${goals}

### Plan of Care
- **Short-term**: Optimize daily movement and address acute stressors/pain.
- **Long-term**: Functional rehabilitation and systemic health optimization.`,

                'Functional Protocols': `### Lifestyle & Activity
- **Exercise**: Structured moderate-intensity cardiovascular exercise 3x/week.
- **Posture & Ergonomics**: Regular movement breaks and ergonomic assessment.
- **Sleep**: Maintain consistent sleep/wake cycle.`,

                'Nutrition': `### Nutritional Recommendations
- **Anti-inflammatory Diet**: Emphasize whole foods, lean proteins, omega-3 fats, and high-fiber vegetables.
- **Hydration**: Target 2-3 liters of filtered water daily.`,

                'Precision Nutrients': `### Suggested Supplements
- **Magnesium Glycinate**: 300-400mg before bed.
- **Vitamin D3**: Optimize levels to support immune and bone health.
- **Omega-3 Fatty Acids**: Anti-inflammatory support.`,

                'Monitoring & Follow-up': `### Clinical Tracking
- Monitor vitals and symptom logs.
- Re-assess functional capacity in 4 weeks.`,

                'Patient Education': `### Understanding Your Health Path
By focusing on nutrition, movement, sleep, and targeted supplementation, we can address the root functional causes of your symptoms and build a foundation for long-term health.`
            };
        }
    }

    async generateComprehensiveReport(patientData: string): Promise<Partial<Record<AnalysisLens, string>>> {
        const isEmergency = this.patientState.isEmergencyMode();
        const currentPhilosophy = this.patientState.activePhilosophy();

        if (!isEmergency && this.patientState.isDemoMode()) {
            this.isLoading.set(true);
            this.error.set(null);
            this.analysisResults.set({});
            this.analysisMetrics.set(null);

            // Simulate network latency / parsing time for premium feel
            await new Promise(resolve => setTimeout(resolve, 600));

            const activeId = this.patientState.patientId();
            const activeName = this.patientState.patientName() || 'Unknown Patient';
            
            let report: Partial<Record<AnalysisLens, string>> = {};

            if (activeId === 'p002') {
                report = this.getDemoReportForPhilosophy(currentPhilosophy);
            } else {
                const history = this.patientState.patientHistory();
                const prebakedEntry = history.find(entry => 
                    (entry.type === 'AnalysisRun' || entry.type === 'FinalizedPatientSummary') && 
                    entry.report && Object.keys(entry.report).length > 0
                );
                
                if (prebakedEntry && (prebakedEntry.type === 'AnalysisRun' || prebakedEntry.type === 'FinalizedPatientSummary') && currentPhilosophy === 'western') {
                    report = prebakedEntry.report;
                } else {
                    report = this.generateDynamicMockReport(activeName, currentPhilosophy);
                }
            }
            
            this.analysisResults.set(report);
            this.lastPatientData.set(patientData);
            this.lastActivePhilosophy.set(currentPhilosophy);
            this.lastRefreshTime.set(new Date());

            const metrics = this.getDemoMetricsForPhilosophy(currentPhilosophy);
            this.analysisMetrics.set(metrics);

            // Mock verification results
            const lenses: AnalysisLens[] = ['Summary Overview', 'Functional Protocols', 'Nutrition', 'Precision Nutrients', 'Monitoring & Follow-up', 'Patient Education'];
            const mockVerification = { status: 'verified', issues: [] };
            const newVerificationResults: Partial<Record<AnalysisLens, { status: string, issues: IVerificationIssue[] }>> = {};
            for (const lens of lenses) {
                newVerificationResults[lens] = mockVerification;
            }
            this.verificationResults.set(newVerificationResults);

            this.isLoading.set(false);
            return report;
        }

        if (!isEmergency && !this.network.useLocalInference() && !this.network.isOnline()) {
            this.error.set("You are currently offline and no local inference endpoint is available.");
            return {};
        }

        this.isLoading.set(true);
        this.error.set(null);
        this.analysisResults.set({});
        this.analysisMetrics.set(null);

        const lenses: AnalysisLens[] = ['Summary Overview', 'Functional Protocols', 'Nutrition', 'Precision Nutrients', 'Monitoring & Follow-up', 'Patient Education'];
        const newReport: Partial<Record<AnalysisLens, string>> = {};

        if (!isEmergency && this.lastPatientData() && this.lastActivePhilosophy() === currentPhilosophy) {
            const isSignificant = await this.ai.detectClinicalChanges(this.lastPatientData()!, patientData);

            if (!isSignificant) {
                console.log("Clinical Delta: No significant changes detected. Reusing existing report.");
                this.lastPatientData.set(patientData);
                this.lastActivePhilosophy.set(currentPhilosophy);

                const currentResults = this.analysisResults() as Record<string, string>;
                if (Object.keys(currentResults).length > 0) {
                    for (const lens of lenses) {
                        const cacheKey = await this.cache.generateKey([patientData, this.systemInstructions[lens], lens]);
                        if (currentResults[lens]) {
                            await this.cache.set(cacheKey, currentResults[lens]);
                        }
                    }
                    await this.generateVisualMetrics(currentResults);
                    this.isLoading.set(false);
                    return currentResults;
                }
            }
        }


        try {
            const orchestrationPromises = lenses.map(async (lens) => {
                const philosophy = this.patientState.activePhilosophy();
                const philosophyInstruction = this.PHILOSOPHY_INSTRUCTIONS[philosophy] || this.PHILOSOPHY_INSTRUCTIONS.western;
                
                const agentName = this.getAgentNameForLens(lens);
                const agentRole = this.getAgentRoleForLens(lens);
                const agentIdentity = `You are ${agentName}, the ${agentRole} for the Pocket Gull Clinical Intelligence Platform. Speak and write from this professional clinical expert persona.`;

                let sysInstruction = agentIdentity + '\n\n' + philosophyInstruction + '\n\n' + this.systemInstructions[lens];
                
                const orcidProfile = this.orcid.orcidProfile();
                if (orcidProfile) {
                    sysInstruction += `\n\nCLINICIAN RESEARCH CONTEXT (ORCID ID: ${orcidProfile.orcidId}):
The consulting clinician is ${orcidProfile.name}.
Their research keywords include: ${orcidProfile.keywords.join(', ')}.
Their published works and projects:
${orcidProfile.works.map(w => `- "${w.title}" (${w.year || 'N/A'}) - ${w.type || 'publication'}${w.url ? ' (URL: ' + w.url + ')' : ''}`).join('\n')}

When formulating recommendations, you should dynamically draw inspiration from their research areas and published works if they are clinically relevant to the patient's state.`;
                }

                if (isEmergency) {
                    sysInstruction = `EMERGENCY FIRST AID MODE: You are assisting a bystander under the Good Samaritan law.
CRITICAL EMERGENCY RULES:
- ONLY suggest Basic Life Support (BLS) steps.
- Restrict advice strictly to CPR (110 BPM), physical airway management, physical stabilizing steps, applying direct pressure, and using a tourniquet.
- ABSOLUTELY PROHIBIT prescribing, recommending, or detailing drug dosages or surgical/invasive procedures.
- Do NOT advise administering medications unless specifically requested by 911 dispatch.
- Focus on immediate physical actions.
- Keep instructions extremely short, bold, and clear.

` + sysInstruction;
                }
                const cacheKey = await this.cache.generateKey([patientData, sysInstruction, lens]);

                try {
                    const cached = await this.cache.get<string>(cacheKey);
                    let responseText = '';

                    if (cached) {
                        responseText = cached;
                        newReport[lens] = responseText;
                        this.analysisResults.update(all => ({ ...all, [lens]: responseText }));
                    } else {
                        // Stream-based generation using native AsyncIterables
                        for await (const chunk of this.ai.generateReportStream$(patientData, lens, sysInstruction)) {
                            if (chunk.startsWith('__TOOL_CALL__:')) {
                                try {
                                    const parsedToolCall = JSON.parse(chunk.substring(14));
                                    if (parsedToolCall.name === 'protein_sequence_similarity_search') {
                                        this.researchHits.set(parsedToolCall.result.hits);
                                    }
                                } catch(e) {}
                                continue;
                            }
                            responseText += chunk;
                            newReport[lens] = responseText;
                            this.analysisResults.update(all => ({ ...all, [lens]: responseText }));
                        }
                        // Apply rules-engine post-processing (disclaimer appends, etc.)
                        responseText = this.rules.evaluateOnResponse(responseText, lens);
                        await this.cache.set(cacheKey, responseText);
                    }

                    try {
                        const verification = await this.ai.verifySection(lens, responseText, patientData);
                        this.verificationResults.update(all => ({ ...all, [lens]: verification }));
                    } catch (verifError) {
                        console.warn(`Verification failed for ${lens}`, verifError);
                    }
                } catch (e: any) {
                    console.error(`Error in lens ${lens}`, e);
                    newReport[lens] = `### Error\nAn error occurred in this section: ${e?.message ?? e}`;
                    this.verificationResults.update(all => ({ ...all, [lens]: undefined }));
                }
            });

            await Promise.allSettled(orchestrationPromises);

            this.lastPatientData.set(patientData);
            this.lastActivePhilosophy.set(currentPhilosophy);
            this.analysisResults.set(newReport);
            this.lastRefreshTime.set(new Date());
            await this.generateVisualMetrics(newReport as Record<string, string>);

            const reportText = lenses.map(lens => newReport[lens]).filter(Boolean).join('\n\n');
            const masterKey = await this.cache.generateKey([reportText, 'MASTER_SNAPSHOT_V1']);
            await this.cache.set(masterKey, {
                report: newReport,
                _metrics: this.analysisMetrics(),
                _timestamp: new Date().toISOString(),
                _isSnapshot: true
            });

            return newReport;
        } catch (e: any) {
            console.error("Critical error in generateComprehensiveReport", e);
            this.error.set(String(e?.message ?? e));
            return {};
        } finally {
            this.isLoading.set(false);
        }
    }

    async startChatSession(patientData: string) {
        const isEmergency = this.patientState.isEmergencyMode();
        if (!isEmergency && !this.network.isOnline() && !this.network.useLocalInference()) {
            this.error.set("You are currently offline and no local inference endpoint is available.");
            return;
        }

        this.transcript.set([]);
        let context = `You are a collaborative care plan co-pilot named "Pocket Gull". You are assisting a doctor in refining a strategy for their patient. You have already reviewed the finalized patient overview and the current recommendations. Your role is to help the doctor iterate on the care plan, explore functional protocols, structure follow-ups, or answer specific questions about the patient's data. Keep your answers brief, actionable, and focused on strategic holistic care. Be ready to elaborate when asked.`;
        if (isEmergency) {
            context = `EMERGENCY FIRST-AID COMPANION: You are assisting a bystander performing immediate triage or resuscitation under Good Samaritan principles.
CRITICAL SAFETY CONSTRAINTS:
- NEVER suggest, prescribe, or discuss drug dosages, chemical interventions, or invasive procedures.
- Focus exclusively on non-invasive Basic Life Support (BLS) interventions: CPR chest compressions (110 BPM), rescue breathing, airway clearing, physical stabilization (recovery position), direct pressure for severe bleeding, and tourniquets.
- Keep all replies extremely direct, concise, and structured in short, clear bullet points for high-stress situations.
- Urgently remind the user to call emergency services (911) if not already done.`;
        } else {
            const philosophy = this.patientState.activePhilosophy();
            if (philosophy === 'eastern') {
                context += `\n\nActive Medicine Mode: Eastern (Traditional Chinese Medicine). Frame your dialogue using TCM perspectives, including Zang-Fu imbalances, Qi and blood dynamics, Yin/Yang harmony, and traditional holistic advice, while keeping the interface and language accessible to modern clinicians.`;
            } else if (philosophy === 'ayurvedic') {
                context += `\n\nActive Medicine Mode: Ayurvedic Medicine. Frame your dialogue using Ayurvedic perspectives, including Doshas (Vata, Pitta, Kapha), Agni, Ama, Dinacharya daily rhythms, and Rasayana support, while translating concepts to align with modern functional medicine and metabolic science.`;
            } else {
                context += `\n\nActive Medicine Mode: Western (Allopathic) Medicine. Frame your dialogue using conventional clinical guidelines, pharmacology, and standard global medical baselines.`;
            }
        }

        const orcidProfile = this.orcid.orcidProfile();
        if (orcidProfile) {
            context += `\n\nCLINICIAN RESEARCH CONTEXT (ORCID ID: ${orcidProfile.orcidId}):
The consulting clinician is ${orcidProfile.name}.
Their research keywords include: ${orcidProfile.keywords.join(', ')}.
Their published works and projects:
${orcidProfile.works.map(w => `- "${w.title}" (${w.year || 'N/A'}) - ${w.type || 'publication'}${w.url ? ' (URL: ' + w.url + ')' : ''}`).join('\n')}

Feel free to reference their research areas and publications if it supports the clinical advice.`;
        }

        await this.ai.startChat(patientData, context);
    }

    async getInitialGreeting(): Promise<string> {
        const isEmergency = this.patientState.isEmergencyMode();
        if (!isEmergency && !this.network.isOnline() && !this.network.useLocalInference()) {
            const errorMsg = "You are currently offline. Please reconnect to consult the AI.";
            this.error.set(errorMsg);
            this.transcript.set([{ role: 'model', text: errorMsg }]);
            return errorMsg;
        }

        this.isLoading.set(true);
        try {
            let prompt = "Start the conversation with a friendly and professional tone. Greet the doctor and confirm you have reviewed the patient's file and are ready for questions.";
            if (isEmergency) {
                prompt = "Start the conversation as an emergency assistant. Briefly state: 'Emergency Bystander Support active. Start CPR if unresponsive (110 BPM metronome available). What is the primary injury or symptom?' Keep it under 2 sentences.";
            }
            const response = await this.ai.getInitialGreeting(prompt);
            this.transcript.set([{ role: 'model', text: response }]);
            return response;
        } catch (e: any) {
            const errorMsg = String(e?.message ?? e);
            this.error.set(errorMsg);
            this.transcript.set([{ role: 'model', text: `Error: ${errorMsg}` }]);
            return `Sorry, an error occurred: ${errorMsg}`;
        } finally {
            this.isLoading.set(false);
        }
    }

    async sendChatMessage(message: string): Promise<string> {
        this.transcript.update(t => [...t, { role: 'user', text: message }]);

        // ── Rules Engine: pre-send guard ────────────────────────────────────────
        const blocked = this.rules.evaluateOnMessage(message);
        if (blocked) {
            this.transcript.update(t => [...t, { role: 'model', text: blocked.reply }]);
            return blocked.reply;
        }

        const isEmergency = this.patientState.isEmergencyMode();
        if (!isEmergency && !this.network.isOnline() && !this.network.useLocalInference()) {
            const errorMsg = "You are currently offline and no local inference endpoint is available.";
            this.error.set(errorMsg);
            this.transcript.update(t => [...t, { role: 'model', text: errorMsg }]);
            return errorMsg;
        }

        this.isLoading.set(true);
        this.error.set(null);

        try {
            let response = await this.ai.sendMessage(message);
            // ── Rules Engine: post-process modifier ─────────────────────────────
            response = this.rules.evaluateOnResponse(response, message);
            this.transcript.update(t => [...t, { role: 'model', text: response }]);
            return response;
        } catch (e: any) {
            const errorMsg = String(e?.message ?? e);
            this.error.set(errorMsg);
            this.transcript.update(t => [...t, { role: 'model', text: `Error: ${errorMsg}` }]);
            return `Sorry, an error occurred: ${errorMsg}`;
        } finally {
            this.isLoading.set(false);
        }
    }

    async clearCache() {
        await this.cache.clear();
    }

    async translateReadingLevel(
        text: string,
        targetLevel?: 'simplified' | 'dyslexia' | 'child' | 'spanish' | 'german' | 'french' | 'mandarin' | 'hindi',
        cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child',
        language?: string
    ): Promise<string> {
        if (!this.network.isOnline() && !this.network.useLocalInference()) {
            const errorMsg = "You are currently offline. Please reconnect to translate text.";
            this.error.set(errorMsg);
            throw new Error(errorMsg);
        }

        this.isLoading.set(true);
        this.error.set(null);
        try {
            return await this.ai.translateReadingLevel(text, targetLevel, cognitiveLevel, language);
        } catch (e: any) {
            const errorMsg = String(e?.message ?? e);
            this.error.set(errorMsg);
            throw new Error(`Translation failed: ${errorMsg}`);
        } finally {
            this.isLoading.set(false);
        }
    }

    async analyzeTranslation(original: string, translated: string): Promise<string> {
        this.isLoading.set(true);
        this.error.set(null);
        try {
            return await this.ai.analyzeTranslation(original, translated);
        } catch (e: any) {
            const errorMsg = String(e?.message ?? e);
            this.error.set(errorMsg);
            throw new Error(`Analysis failed: ${errorMsg}`);
        } finally {
            this.isLoading.set(false);
        }
    }

    async analyzeRadiologyImage(base64Image: string, context?: string): Promise<string> {
        this.isLoading.set(true);
        this.error.set(null);
        try {
            return await this.ai.analyzeImage(base64Image, context);
        } catch (e: any) {
            const errorMsg = String(e?.message ?? e);
            this.error.set(errorMsg);
            throw new Error(`Image analysis failed: ${errorMsg}`);
        } finally {
            this.isLoading.set(false);
        }
    }
}

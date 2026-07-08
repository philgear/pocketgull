import {
  Injectable,
  inject,
  signal,
  effect,
  WritableSignal,
  computed,
  untracked,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { PatientStateService } from "./patient-state.service";
import { StorageService } from "./storage.service";
import {
  ClinicalIntelligenceService,
  AnalysisLens,
} from "./clinical-intelligence.service";
import { NetworkStateService } from './network-state.service';
import {
  IBookmark,
  HistoryEntry,
  IPatient,
  IPatientState,
  IBodyPartIssue,
  IDiagnosticScan
} from "./patient.types";
import * as CryptoJS from 'crypto-js';
import { dataConnect } from '../lib/firebase';
import { listPatients, getPatientWithCarePlan, createPatient } from '../lib/dataconnect';

const ENCRYPTION_KEY = 'pocket-gull-clinical-vault-key-poc';

// Re-export for use in other components
export type { IBodyPartIssue, HistoryEntry, IPatient };

// Mock Data
const MOCK_PATIENTS: IPatient[] = [
  {
    id: "p_phil_gear",
    name: "Phil Gear",
    age: 42,
    gender: "Male",
    lastVisit: "2026.06.08",
    preexistingConditions: [
      "Mild Hypertension",
      "Mild Sleep Apnea (CPAP-managed)",
      "Chronic Tension Headache",
      "Developer & Founder (High Cognitive Load)",
    ],
    patientGoals:
      "Optimize metabolic health, resolve evening tension headaches, reduce sleep latency to under 20 minutes, and synchronize biometrics from Google Health Connect.",
    vitals: {
      bp: "122/82",
      hr: "64",
      temp: "98.4°F",
      spO2: "98%",
      weight: "178 lbs",
      height: "5'10\"",
      vitD3: "28 ng/mL (Sub-optimal)",
      magnesium: "1.7 mg/dL (Low-normal)",
      b12: "412 pg/mL (Adequate)",
      zinc: "82 mcg/dL (Optimal)",
    },
    oxidativeStressMarkers: [
      { id: "1", name: "Homocysteine", value: "10.2 μmol/L (Borderline)" },
      { id: "2", name: "hsCRP", value: "1.4 mg/L (Low-grade)" },
    ],
    antioxidantSources: [
      { id: "1", name: "Glutathione (GSH)", value: "1.8 μmol/g Hb (Adequate)" },
      { id: "2", name: "CoQ10", value: "0.62 μg/mL (Adequate)" },
    ],
    medications: [
      { id: "1", name: "Lisinopril", value: "10mg Daily" },
      { id: "2", name: "Melatonin", value: "0.5mg PRN sleep onset" },
    ],
    biometricHistory: [
      { timestamp: "2025-12-01T08:00:00Z", type: "hr", value: "72" },
      { timestamp: "2026-01-15T08:00:00Z", type: "hr", value: "70" },
      { timestamp: "2026-02-20T08:00:00Z", type: "hr", value: "68" },
      { timestamp: "2026-03-15T08:00:00Z", type: "hr", value: "66" },
      { timestamp: "2026-04-10T08:00:00Z", type: "hr", value: "65" },
      { timestamp: "2026-06-08T08:00:00Z", type: "hr", value: "64" },
      { timestamp: "2025-12-01T08:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2026-01-15T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2026-02-20T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2026-03-15T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2026-04-10T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2026-06-08T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2025-12-01T08:00:00Z", type: "bp", value: "130/88" },
      { timestamp: "2026-01-15T08:00:00Z", type: "bp", value: "128/85" },
      { timestamp: "2026-02-20T08:00:00Z", type: "bp", value: "126/84" },
      { timestamp: "2026-03-15T08:00:00Z", type: "bp", value: "124/83" },
      { timestamp: "2026-04-10T08:00:00Z", type: "bp", value: "123/82" },
      { timestamp: "2026-06-08T08:00:00Z", type: "bp", value: "122/82" },
    ],
    issues: {
      head: [
        {
          id: "head",
          noteId: "note_phil_head_1",
          name: "Head & Neck",
          painLevel: 3,
          description:
            "Mild-to-moderate tension headaches occurring 3-4x per week in the evening after extended screen time. Associated with suboccipital tightness and eye strain. Worsens with caffeine excess and poor sleep.",
          symptoms: [
            { name: "Tension headache", type: "Neurological", verified: true, timeline: "Recurrent" },
            { name: "Sleep onset insomnia", type: "Neurological/Sleep", verified: true, timeline: "Chronic" },
          ],
        },
      ],
      upper_back: [
        {
          id: "upper_back",
          noteId: "note_phil_back_1",
          name: "Upper Back & Shoulders",
          painLevel: 2,
          description:
            "Mild trapezius tightness bilaterally. Attributable to prolonged seated developer posture and laptop use. Improves with movement.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.06.08",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nPhil Gear presents as a high-cognitive-load developer and founder managing mild hypertension, CPAP-treated sleep apnea, and recurrent tension headaches. The primary drivers are screen-time-induced circadian disruption, suboptimal intracellular magnesium, borderline Vitamin D3, and low-grade sympathetic nervous system dominance from sustained work demands.\n\n### Priority List\n*   **Circadian Realignment**: Blue-light hygiene and structured morning anchor protocol.\n*   **Magnesium Repletion**: Targeting NMDA receptor stabilization and tension headache reduction.\n*   **HPA Axis Support**: Adaptogenic protocol to reduce cortisol load from founder stress.\n*   **Biometric Tracking**: Google Health Connect integration for daily HRV, HR, and SpO2 trend analysis.\n\n### Plan of Care\n*   Initiate magnesium glycinate and Vitamin D3/K2 protocol.\n*   Implement strict circadian anchor routine (sleep onset 10:30 PM target).\n*   Introduce zone 2 cardio 3x/week to support HRV recovery.\n*   Follow-up biometric review in 4 weeks.\n\n### Goals\n*   **Short-term (4 weeks)**: Reduce headache frequency by 50%. Sleep latency < 20 minutes.\n*   **Long-term (3 months)**: BP < 120/80, HRV improvement > 15%, and stable circadian rhythm.",
          "Functional Protocols":
            "### Immediate Actions (72 hours)\n*   Install blue-light blocking glasses or activate Night Shift/f.lux after 7:00 PM.\n*   Move all high-cognitive-load work to before 4:00 PM; reserve evenings for low-stimulation activities.\n\n### Circadian Anchor Protocol\n| Anchor Point | Activity | Rationale |\n| :--- | :--- | :--- |\n| 6:30 AM | 10-min outdoor sunlight + cold splash | Cortisol pulse suppression + circadian set |\n| 12:00 PM | Walk (20 min) | Zone 2 + insulin sensitivity reset |\n| 7:00 PM | Blue-light off; dim lighting | Melatonin onset preservation |\n| 10:30 PM | Target sleep onset | 8h sleep window for apnea management |\n\n### Foundational Protocol\n*   Zone 2 cardio (HR 120-140): 3x per week, 30-45 minutes (cycle or treadmill)\n*   Daily 4-7-8 breathing (evening): 4 rounds before sleep to activate parasympathetic tone\n*   Posture reset: Chin tucks + thoracic extension x 10 reps every 90 minutes at desk",
          Nutrition:
            "### Biochemical Assessment\nPhil's dietary profile shows adequate macronutrient intake but micronutrient gaps in magnesium (chronic dietary shortfall in Western male developers) and Vitamin D3 (insufficient outdoor exposure). Borderline homocysteine suggests mild methylation strain from high cognitive demand.\n\n### Nutrition Targets\n*   **Magnesium Repletion**: Top dietary priority — target 420mg elemental/day.\n*   **Vitamin D3 Optimization**: Combined dietary + supplement target 50 ng/mL serum level.\n*   **Anti-inflammatory Pattern**: Reduce arachidonic acid load from processed snacks.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Magnesium Glycinate | 400mg | Before bed | NMDA / Muscle tension / Sleep |\n| Vitamin D3 + K2 | 5000 IU / 100mcg | With breakfast | Immune / Bone / Mood |\n| Omega-3 EPA/DHA | 2000mg | With meals | hsCRP reduction / Cardiovascular |\n| L-Theanine | 200mg | Pre-work + evening | Focus / Cortisol smoothing |\n\n### Dietary Adjustments\n- **Add**: Dark leafy greens (400g/day), pumpkin seeds (30g/day), avocado (daily)\n- **Reduce**: Caffeine after 1:00 PM; switch to L-theanine + green tea after noon\n- **Hydration**: 2.5L water/day minimum; add electrolytes (sodium, potassium) to morning water",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Begin magnesium glycinate + Vitamin D3/K2 protocol immediately.\n2.  Set up Google Health Connect dashboard for daily HR, HRV, and SpO2 monitoring.\n3.  Activate blue-light blocking protocol.\n4.  4-week check-in: assess headache frequency, sleep latency, and resting HR trend.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Resting HR | < 62 bpm | Daily (wearable) | > 75 bpm for 3+ days |\n| Sleep Latency | < 20 min | Daily | > 45 min on 3+ consecutive nights |\n| Headache Frequency | < 1x/week | Weekly log | > 4x/week or severity > 6/10 |\n| BP | < 120/80 | Bi-weekly | > 135/85 on 2 consecutive readings |\n| Serum Vitamin D3 | 50-70 ng/mL | 12-week lab | < 30 ng/mL |\n\n### Long-term Trajectory (6+ months)\nWith consistent execution, Phil should see normalization of BP without Lisinopril dose increase, significant HRV improvement via wearable tracking, and elimination of recurrent tension headaches. Quarterly biometric reviews via Google Health Connect will guide protocol adjustments.",
          "Patient Education":
            "### Understanding Your Health Picture\nYour body is dealing with the classic high-performance developer pattern: sustained mental output without adequate physical recovery, low dietary magnesium, disrupted circadian rhythm from screens, and compounding sympathetic nervous system activation from founder responsibilities.\n\n### What Was Found\n*   **Magnesium Gap**: This single deficiency explains your tension headaches, mild sleep issues, and suboptimal BP control.\n*   **Circadian Disruption**: Screen-induced blue light is delaying your melatonin onset by 1-2 hours, fragmenting your sleep architecture.\n*   **Low-Grade Inflammation**: Your hsCRP of 1.4 mg/L is manageable but warrants dietary attention.\n\n### Your Action Plan\n*   **Tonight**: Take magnesium glycinate before bed. Install f.lux or Night Shift. This will produce measurable results within 72 hours.\n*   **This Week**: Walk for 20 minutes at lunch daily. No caffeine after 1:00 PM.\n*   **Month 1**: Track sleep + HRV daily. Report any headaches in the Pocket Gull app.\n\n### Important Notes\n> 💡 Your Lisinopril is doing its job — do not stop it. These protocols are designed to work alongside it, and over time may reduce the dose required. Always consult your prescribing physician before any medication changes.",
          "Precision Nutrients":
            "### Biochemical & Biomarker Matrix\nPhil's orthomolecular profile is consistent with a high-cognitive-load male in his early 40s: suboptimal intracellular magnesium (the most common deficiency in Western male knowledge workers), insufficient Vitamin D3, and borderline homocysteine signaling mild methylation cycle strain. CoQ10 and glutathione are adequate.\n\n```json\n[\n  { \"name\": \"Magnesium\", \"level\": \"Sub-optimal\", \"pathway\": \"NMDA / ATP Synthesis / Sleep\" },\n  { \"name\": \"Vitamin D3\", \"level\": \"Sub-optimal\", \"pathway\": \"Immune / Mood / Bone\" },\n  { \"name\": \"Vitamin B12\", \"level\": \"Optimal\", \"pathway\": \"Methylation\" },\n  { \"name\": \"Zinc\", \"level\": \"Optimal\", \"pathway\": \"Immune / Hormones\" },\n  { \"name\": \"Homocysteine\", \"level\": \"Borderline\", \"pathway\": \"Cardiovascular / Methylation\" },\n  { \"name\": \"CoQ10\", \"level\": \"Adequate\", \"pathway\": \"Mitochondrial / Cardiac\" }\n]\n```\n\n### Detected Deficiencies\n- **Magnesium (Sub-optimal)**: NMDA receptor hyperexcitability from low Mg directly causes tension-type headaches and sleep-onset difficulty. Priority one intervention.\n- **Vitamin D3 (Sub-optimal at 28 ng/mL)**: Target is 50-70 ng/mL. Low D3 contributes to mood instability, impaired immune surveillance, and suboptimal serotonin synthesis.\n- **Homocysteine (Borderline at 10.2 μmol/L)**: Suggests mild one-carbon metabolism strain. May worsen if cognitive demand continues without B-vitamin support.\n\n### Orthomolecular Protocol\n| Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway |\n|---|---|---|---|\n| Magnesium Glycinate | 400mg elemental | Oral, nightly with food | NMDA antagonism / Tension headache / Sleep |\n| Vitamin D3 + K2 | 5000 IU D3 / 100mcg MK-7 | Oral with fat-containing meal | Serum D3 optimization / Bone / Mood |\n| L-Methylfolate (5-MTHF) | 400mcg | Oral with B12 | Homocysteine reduction / Methylation |\n| L-Theanine | 200mg | Oral (AM + PM) | Alpha-wave induction / Cortisol smoothing |\n| Omega-3 EPA/DHA | 2000mg | Oral with meals | hsCRP reduction / Cardiovascular |\n\n### Cautions & Interactions\n- **Magnesium + Lisinopril**: Generally well-tolerated; high-dose Mg may slightly lower BP — monitor for dizziness. Adjust Lisinopril if BP drops below 110/70.\n- **L-Methylfolate + SSRI (if initiated)**: Monitor for serotonin syndrome if antidepressant therapy is ever added; methylfolate enhances serotonergic activity.\n- **Vitamin D3 Toxicity**: Recheck 25(OH)D at 12 weeks; target 50-70 ng/mL. Above 100 ng/mL carries hypercalcemia risk."
        }
      },
      {
        type: "Visit",
        date: "2026.03.15",
        summary: "Initial biometric review: HRV trending low, sleep latency complaints, and headache pattern established.",
        state: {
          patientGoals: "Reduce headache frequency and improve sleep quality.",
          vitals: {
            bp: "126/84", hr: "68", temp: "98.5°F", spO2: "97%",
            weight: "180 lbs", height: "5'10\"",
          },
          oxidativeStressMarkers: [],
          antioxidantSources: [],
          medications: [{ id: "1", name: "Lisinopril", value: "10mg Daily" }],
          issues: {
            head: [{
              id: "head", noteId: "note_phil_head_hist1", name: "Head & Neck",
              painLevel: 4, description: "Frequent evening headaches, 4-5x per week. Attributable to screen time.",
              symptoms: [],
            }],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [],
  },
  {
    id: "p_mara_santos",
    name: "Mara Santos",
    age: 34,
    gender: "Female",
    lastVisit: "2026.06.20",
    preexistingConditions: [
      "Relapsing-Remitting Multiple Sclerosis (RRMS)",
      "History of Optic Neuritis (Left Eye, 2024)",
      "Chronic Fatigue",
      "Mild Depression (reactive)",
      "Vitamin D Deficiency",
    ],
    patientGoals:
      "Extend relapse-free interval, manage fatigue without additional sedating medications, preserve cognitive function, and explore integrative approaches alongside DMT.",
    vitals: {
      bp: "108/68",
      hr: "76",
      temp: "98.1°F",
      spO2: "97%",
      weight: "138 lbs",
      height: "5'6\"",
      vitD3: "18 ng/mL (Deficient)",
      magnesium: "1.6 mg/dL (Low)",
      b12: "310 pg/mL (Low-normal)",
      zinc: "68 mcg/dL (Low-normal)",
    },
    oxidativeStressMarkers: [
      { id: "1", name: "hsCRP", value: "3.2 mg/L (Elevated)" },
      { id: "2", name: "Homocysteine", value: "14.1 μmol/L (Elevated)" },
      { id: "3", name: "Neurofilament Light Chain (NfL)", value: "18.2 pg/mL (Elevated)" },
    ],
    antioxidantSources: [
      { id: "1", name: "Glutathione (GSH)", value: "1.1 μmol/g Hb (Low)" },
      { id: "2", name: "CoQ10", value: "0.38 μg/mL (Low)" },
      { id: "3", name: "Alpha-Lipoic Acid", value: "Not tested" },
    ],
    medications: [
      { id: "1", name: "Ocrevus (Ocrelizumab)", value: "600mg IV q6mo" },
      { id: "2", name: "Baclofen", value: "10mg TID (spasticity)" },
      { id: "3", name: "Modafinil", value: "100mg AM (fatigue)" },
      { id: "4", name: "Escitalopram", value: "10mg Daily" },
    ],
    biometricHistory: [
      { timestamp: "2025-12-01T08:00:00Z", type: "hr", value: "82" },
      { timestamp: "2026-01-15T08:00:00Z", type: "hr", value: "80" },
      { timestamp: "2026-03-10T08:00:00Z", type: "hr", value: "78" },
      { timestamp: "2026-04-20T08:00:00Z", type: "hr", value: "77" },
      { timestamp: "2026-06-20T08:00:00Z", type: "hr", value: "76" },
      { timestamp: "2025-12-01T08:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2026-01-15T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2026-03-10T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2026-04-20T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2026-06-20T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2025-12-01T08:00:00Z", type: "bp", value: "112/72" },
      { timestamp: "2026-01-15T08:00:00Z", type: "bp", value: "110/70" },
      { timestamp: "2026-03-10T08:00:00Z", type: "bp", value: "108/68" },
      { timestamp: "2026-04-20T08:00:00Z", type: "bp", value: "110/70" },
      { timestamp: "2026-06-20T08:00:00Z", type: "bp", value: "108/68" },
    ],
    issues: {
      head: [
        {
          id: "head",
          noteId: "note_mara_head_1",
          name: "Head & Neurological",
          painLevel: 4,
          description:
            "Cognitive fog ('cog fog') worsening in afternoon. Word-finding difficulty during conversations. Mild persistent headache post-Ocrevus infusion (resolves in 48h). History of left optic neuritis with residual color desaturation.",
          symptoms: [
            { name: "Cognitive fog", type: "Neurological", verified: true, timeline: "Chronic" },
            { name: "Word-finding difficulty", type: "Neurological", verified: true, timeline: "Progressive" },
            { name: "Visual color desaturation (L)", type: "Ophthalmological", verified: true, timeline: "Residual" },
          ],
        },
      ],
      lower_back: [
        {
          id: "lower_back",
          noteId: "note_mara_back_1",
          name: "Lumbar Spine & Lower Extremities",
          painLevel: 5,
          description:
            "Bilateral lower extremity spasticity, worse in the morning. Lhermitte's sign positive — electric shock sensation down spine on neck flexion. Gait instability increasing over last 3 months, using a cane intermittently.",
          symptoms: [
            { name: "Lower limb spasticity", type: "Neurological/Motor", verified: true, timeline: "Chronic" },
            { name: "Lhermitte's sign", type: "Neurological", verified: true, timeline: "Active" },
            { name: "Gait instability", type: "Neurological/Motor", verified: true, timeline: "Progressive" },
          ],
        },
      ],
      chest: [
        {
          id: "chest",
          noteId: "note_mara_chest_1",
          name: "Chest & Respiratory",
          painLevel: 2,
          description:
            "Occasional MS hug — band-like tightness around the ribcage, typically triggered by heat or stress. Resolves with cooling and rest. No cardiac involvement suspected.",
          symptoms: [
            { name: "MS hug (dysesthesia)", type: "Neurological/Sensory", verified: true, timeline: "Intermittent" },
          ],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.06.20",
        summary: "Comprehensive MS Management Review",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nMara Santos is a 34-year-old female with relapsing-remitting multiple sclerosis (RRMS), diagnosed in 2023 following an episode of left optic neuritis. She is currently on Ocrevus (ocrelizumab) disease-modifying therapy with stable MRI lesion burden. Primary concerns are progressive fatigue, increasing cognitive fog, lower extremity spasticity with gait instability, and reactive depression.\n\n### Priority List\n*   **Neuroprotection**: Maximize myelin preservation and mitochondrial support in the CNS.\n*   **Fatigue Management**: Address the multifactorial MS fatigue (central, peripheral, sleep disruption, and deconditioning).\n*   **Spasticity Optimization**: Refine Baclofen timing and add non-pharmacological interventions.\n*   **Cognitive Rehabilitation**: Structured neuroplasticity exercises to counter cog fog.\n*   **Vitamin D Repletion**: Critical immunomodulatory gap — 18 ng/mL is dangerously low for RRMS.\n\n### Plan of Care\n*   Aggressive Vitamin D3 repletion to target 60-80 ng/mL (immune modulation + neuroprotection).\n*   CoQ10 + Alpha-Lipoic Acid protocol for mitochondrial rescue.\n*   Structured aquatic therapy program for spasticity + cardiovascular conditioning.\n*   Cognitive rehabilitation: daily dual-task training (walking + mental arithmetic).\n*   Reassess NfL and MRI at 6 months to track subclinical disease activity.\n\n### Goals\n*   **Short-term (4 weeks)**: Fatigue severity scale (FSS) reduction by 20%. Gait confidence improvement.\n*   **Long-term (6 months)**: Extend relapse-free interval to 18+ months. Serum Vitamin D3 > 60 ng/mL. Stabilize EDSS score.",
          "Functional Protocols":
            "### Immediate Actions (72 hours)\n*   Begin high-dose Vitamin D3 loading protocol: 10,000 IU/day for 8 weeks, then 5,000 IU maintenance.\n*   Add CoQ10 200mg BID with meals for mitochondrial support.\n*   Schedule aquatic therapy evaluation — pool temperature must be < 84°F (Uhthoff's precaution).\n\n### Movement & Rehabilitation Protocol\n| Intervention | Frequency | Duration | Precautions |\n| :--- | :--- | :--- | :--- |\n| Aquatic therapy (cool pool) | 3x/week | 30 min | Temp < 84°F; monitor for Uhthoff's |\n| Yoga Nidra (guided rest) | Daily | 20 min | For fatigue + parasympathetic reset |\n| Dual-task gait training | 5x/week | 15 min | Walking + cognitive tasks simultaneously |\n| Progressive resistance (seated) | 2x/week | 20 min | Target proximal muscle groups |\n\n### Spasticity Management\n*   Baclofen timing optimization: shift from TID to QID with lower individual doses (7.5mg x4) to smooth coverage.\n*   Add evening stretching routine (hamstrings, hip flexors, calves) — 15 min before bed.\n*   Consider trial of CBD oil (15mg sublingual) for breakthrough spasticity — discuss with neurologist.\n\n### Heat Sensitivity Protocol\n*   Cooling vest for any outdoor activity > 75°F.\n*   Pre-cooling before exercise (cold towel on neck, cold water).\n*   Avoid hot baths/showers; use lukewarm water only.",
          Nutrition:
            "### Biochemical Assessment\nMara's nutritional profile reveals significant micronutrient depletion consistent with active autoimmune neuroinflammation. Vitamin D deficiency is the most critical gap — studies show RRMS patients with serum D3 > 50 ng/mL have 50-70% fewer relapses. Glutathione depletion signals oxidative stress in the CNS.\n\n### Nutrition Targets\n*   **Vitamin D3**: Aggressive repletion to 60-80 ng/mL — immunomodulatory priority.\n*   **Anti-inflammatory Diet**: Mediterranean-style with emphasis on omega-3 fatty acids.\n*   **Gut-Brain Axis**: Microbiome support for immune regulation.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | Immune modulation / Neuroprotection |\n| Omega-3 EPA/DHA | 3000mg (high EPA) | Oral with meals | Neuroinflammation / Myelin integrity |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Antioxidant |\n| Probiotics (multi-strain) | 50B CFU | Oral AM | Gut-brain axis / Immune regulation |\n\n### Dietary Pattern\n- **Adopt**: Modified Mediterranean / Wahls Protocol Level 1 — 9 cups vegetables daily (3 cups greens, 3 cups sulfur-rich, 3 cups deeply colored)\n- **Eliminate**: Gluten, dairy, refined sugar (30-day elimination trial to assess neuroinflammatory response)\n- **Emphasize**: Wild-caught fatty fish 3x/week, bone broth daily, fermented vegetables",
          "Monitoring & Follow-up":
            "### Immediate Monitoring (0-30 days)\n1.  Baseline Fatigue Severity Scale (FSS) and Modified Fatigue Impact Scale (MFIS) scores.\n2.  Recheck serum 25(OH)D at 8 weeks — target > 60 ng/mL.\n3.  Begin daily fatigue diary in Pocket Gull (rate 1-10, morning + afternoon).\n4.  Monitor Baclofen dose adjustment — watch for increased drowsiness.\n\n### Ongoing Surveillance\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Serum Vitamin D3 | 60-80 ng/mL | 8 weeks, then quarterly | < 30 ng/mL or > 100 ng/mL |\n| Neurofilament Light (NfL) | < 10 pg/mL | Every 6 months | Rising trend = subclinical activity |\n| EDSS Score | Stable or improving | Every 6 months | Any 0.5-point increase |\n| MRI Brain + C-spine | No new T2 lesions | Annual (or if symptoms) | New enhancing lesions |\n| Fatigue Severity Scale | < 4.0 | Monthly | > 5.5 sustained |\n| 25-ft Walk Test | Stable or improving | Every 3 months | > 20% decline |\n\n### Red Flags — Seek Immediate Care\n> ⚠️ New or worsening visual loss, sudden limb weakness, bladder retention, or severe vertigo lasting > 24 hours may indicate a relapse. Contact your MS neurologist immediately — do NOT wait for a scheduled visit.\n\n### Long-term Trajectory\nWith Ocrevus maintaining immune suppression, aggressive Vitamin D repletion, mitochondrial support, and structured rehabilitation, Mara's trajectory should show stabilization of EDSS and extension of the relapse-free interval. The elevated NfL (18.2 pg/mL) warrants close 6-month surveillance.",
          "Patient Education":
            "### Understanding Multiple Sclerosis\nYour immune system is mistakenly attacking the myelin coating on your nerve fibers — think of it like the insulation on electrical wires getting damaged. When the insulation is thin or missing, the signals slow down or short-circuit. That's why you experience the fatigue, the fog, the spasticity, and the tingling.\n\n### What Your Care Plan Addresses\n*   **The Fatigue**: MS fatigue isn't just 'being tired.' Your brain is working harder to route signals around damaged areas — like a GPS rerouting around road closures. The CoQ10 and mitochondrial support help your nerve cells produce more energy for this extra work.\n*   **The Spasticity**: Your muscles are getting garbled signals, causing them to tighten when they shouldn't. Baclofen helps quiet these signals, and aquatic therapy gives your body a low-gravity environment to move freely.\n*   **The Cognitive Fog**: Your brain can rewire itself (neuroplasticity). The dual-task exercises are training your brain to build new pathways around the damaged ones.\n*   **Vitamin D**: This is not just a vitamin for you — it's a critical immune system regulator. Keeping your levels high has been shown to significantly reduce MS relapses.\n\n### Your Action Plan\n*   **Today**: Start Vitamin D3 with your next meal. This is the single most impactful thing you can do right now.\n*   **This Week**: Begin the evening stretching routine for spasticity. Try the Yoga Nidra recording for fatigue.\n*   **This Month**: Schedule aquatic therapy evaluation. Start the fatigue diary in the app.\n\n### Important Safety Notes\n> 💡 Never skip your Ocrevus infusions — they are the foundation protecting your brain from new attacks. Everything else we're doing is designed to work alongside your DMT, not replace it.\n> \n> 🌡️ Heat is your enemy. Always have a cooling strategy before exercise or hot days. Even a warm shower can temporarily worsen your symptoms (Uhthoff's phenomenon) — this is not a relapse, it's temporary.",
          "Precision Nutrients":
            "### Biochemical & Biomarker Matrix\nMara's orthomolecular profile is characteristic of active CNS autoimmune disease: severe Vitamin D deficiency driving immune dysregulation, depleted glutathione indicating oxidative stress on oligodendrocytes, low CoQ10 impairing mitochondrial respiration in demyelinated axons, and elevated homocysteine suggesting methylation pathway strain.\n\n```json\n[\n  { \"name\": \"Vitamin D3\", \"level\": \"Deficient\", \"pathway\": \"Immune Modulation / T-reg / Neuroprotection\" },\n  { \"name\": \"Glutathione (GSH)\", \"level\": \"Low\", \"pathway\": \"Antioxidant / Oligodendrocyte Protection\" },\n  { \"name\": \"CoQ10\", \"level\": \"Low\", \"pathway\": \"Mitochondrial Respiration / Axonal Energy\" },\n  { \"name\": \"Vitamin B12\", \"level\": \"Low-normal\", \"pathway\": \"Myelin Synthesis / Methylation\" },\n  { \"name\": \"Homocysteine\", \"level\": \"Elevated\", \"pathway\": \"Cardiovascular / Neurotoxicity\" },\n  { \"name\": \"Magnesium\", \"level\": \"Low\", \"pathway\": \"NMDA / Spasticity / Sleep\" },\n  { \"name\": \"Zinc\", \"level\": \"Low-normal\", \"pathway\": \"Immune / Blood-Brain Barrier\" }\n]\n```\n\n### Detected Deficiencies & MS Relevance\n- **Vitamin D3 (Deficient at 18 ng/mL)**: The most important modifiable risk factor in RRMS. Low D3 is associated with higher relapse rates, faster disability accumulation, and increased MRI lesion burden. Target: 60-80 ng/mL.\n- **Glutathione (Low at 1.1 μmol/g Hb)**: Oligodendrocytes (the cells that make myelin) are exquisitely sensitive to oxidative stress. Depleted GSH accelerates demyelination.\n- **CoQ10 (Low at 0.38 μg/mL)**: Demyelinated axons require dramatically more energy to conduct signals. Low CoQ10 = mitochondrial failure = axonal degeneration.\n- **Homocysteine (Elevated at 14.1 μmol/L)**: Neurotoxic at elevated levels; impairs myelin synthesis and increases BBB permeability.\n\n### Precision Nutrient Protocol\n| Intervention/Molecule | Therapeutic Dose | Delivery | Targeted Pathway |\n|---|---|---|---|\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | T-reg upregulation / Neuroprotection |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Oligodendrocyte shield |\n| CoQ10 (Ubiquinol) | 200mg BID | Oral with fat | Mitochondrial Complex I-III rescue |\n| Methylcobalamin (B12) | 1000mcg sublingual | Daily | Myelin synthesis / Homocysteine clearance |\n| L-Methylfolate (5-MTHF) | 800mcg | Oral | Methylation cycle / Homocysteine clearance |\n| Alpha-Lipoic Acid (R-ALA) | 600mg | Oral | BBB-crossing antioxidant / Neuroprotection |\n| Magnesium Glycinate | 400mg | Oral, nightly | NMDA modulation / Spasticity / Sleep |\n\n### Cautions & Interactions\n- **Vitamin D3 + Ocrevus**: Monitor calcium levels quarterly; immunosuppression + high-dose D3 requires careful calcium homeostasis surveillance.\n- **NAC + Escitalopram**: NAC may modulate glutamatergic neurotransmission; generally synergistic with SSRIs but monitor for mood changes.\n- **Alpha-Lipoic Acid + Blood Sugar**: R-ALA can lower blood glucose; monitor if Mara ever starts corticosteroids for relapse treatment.\n- **B12 Supplementation**: Use methylcobalamin form specifically — cyanocobalamin requires hepatic conversion that may be impaired in MS."
        }
      },
      {
        type: "Visit",
        date: "2026.03.10",
        summary: "Post-infusion follow-up. Fatigue worsening, gait instability noted. NfL drawn — elevated at 18.2 pg/mL.",
        state: {
          patientGoals: "Address worsening fatigue and leg stiffness.",
          vitals: {
            bp: "110/70", hr: "78", temp: "98.2°F", spO2: "97%",
            weight: "140 lbs", height: "5'6\"",
          },
          oxidativeStressMarkers: [],
          antioxidantSources: [],
          medications: [
            { id: "1", name: "Ocrevus", value: "600mg IV q6mo" },
            { id: "2", name: "Baclofen", value: "10mg TID" },
          ],
          issues: {
            lower_back: [{
              id: "lower_back", noteId: "note_mara_back_hist1", name: "Lower Extremities",
              painLevel: 4, description: "Increasing morning stiffness in both legs. Using cane more frequently.",
              symptoms: [],
            }],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [],
  }
];
@Injectable({
  providedIn: "root",
})
export class PatientManagementService {
  private patientState = inject(PatientStateService);
  private geminiService = inject(ClinicalIntelligenceService);
  private network = inject(NetworkStateService);
  private http = inject(HttpClient);
  public storage = inject(StorageService);

  readonly patients = signal<IPatient[]>(MOCK_PATIENTS);
  readonly selectedPatientId: WritableSignal<string | null> = signal(
    MOCK_PATIENTS.find(p => p.id === 'p_phil_gear')?.id || MOCK_PATIENTS.find(p => p.id === 'p012')?.id || MOCK_PATIENTS[0]?.id || null,
  );
  readonly selectedPatient = computed(() => {
    const id = this.selectedPatientId();
    return id ? this.patients().find((p) => p.id === id) : null;
  });

  private async initRoster() {
    if (typeof window !== 'undefined') {
        try {
          const res = await listPatients(dataConnect);
          if (res.data && res.data.patients && res.data.patients.length > 0) {
            const dbPatients = res.data.patients.map(p => ({
              id: p.id,
              name: `${p.firstName} ${p.lastName}`,
              age: 0,
              gender: "Other" as const,
              lastVisit: new Date(p.updatedAt).toISOString().split('T')[0].replace(/-/g, '.'),
              preexistingConditions: [],
              patientGoals: "",
              vitals: { bp: "", hr: "", temp: "", spO2: "", weight: "", height: "" },
              issues: {},
              history: [],
              bookmarks: []
            }));
            this.patients.set(dbPatients);
            const defaultId = dbPatients.find(p => p.name === 'Phil Gear')?.id || dbPatients[0]?.id || null;
            this.selectedPatientId.set(defaultId);
            return;
          }
        } catch (err) {
          console.error('Failed to load roster from SQL Connect:', err);
        }

        const loaded = await this.storage.loadPatients();
        if (loaded && loaded.length > 0) {
            let updatedList = [...loaded];
            let modified = false;
            for (const p of MOCK_PATIENTS) {
                if (!updatedList.some(item => item.id === p.id)) {
                    updatedList.push(p);
                    await this.storage.savePatient(p);
                    modified = true;
                }
            }
            this.patients.set(updatedList);
            const defaultId = updatedList.find(p => p.id === 'p_phil_gear')?.id || updatedList[0]?.id || null;
            this.selectedPatientId.set(defaultId);
        } else {
            // Seed DB on first run
            for (const p of MOCK_PATIENTS) {
                await this.storage.savePatient(p);
            }
        }
    }
  }

  constructor() {
    this.initRoster();

    // Persist to IndexedDB whenever patients array changes
    effect(() => {
        const currentData = this.patients();
        untracked(() => {
            currentData.forEach(p => this.storage.savePatient(p));
        });
    });

    // This effect runs whenever the selected patient changes.
    // It's the central point for orchestrating app state updates.
    effect(() => {
      const patientId = this.selectedPatientId();

      if (patientId) {
        // Important: Use untracked here so we only run this effect when the *selected patient ID* changes,
        // NOT every time the patients array updates (which happens on every keystroke due to auto-save).
        const patient = untracked(() =>
          this.patients().find((p) => p.id === patientId),
        );
        if (patient) {
          // Load the selected patient's data into the main state service
          this.patientState.loadState(patient);
          this.findAndLoadActivePatientSummary(patient.history);

          // Reset the AI analysis first, then load the existing one if we have it
          this.geminiService.resetAIState();

          const latestAnalysis = patient.history.find(
            (entry) =>
              entry.type === "AnalysisRun" ||
              entry.type === "FinalizedPatientSummary",
          );
          if (latestAnalysis) {
            if (latestAnalysis.type === "AnalysisRun") {
              this.geminiService.loadArchivedAnalysis(latestAnalysis.report);
            } else if (latestAnalysis.type === "FinalizedPatientSummary") {
              this.geminiService.loadArchivedAnalysis(latestAnalysis.report);
            }
          }
        }
      } else {
        // No patient is selected, so clear the state for a new entry
        this.patientState.clearState();
        this.geminiService.resetAIState();
      }
    }); // Warning: direct signal writes in effects are discouraged but sometimes necessary for orchestration
  }

  private findAndLoadActivePatientSummary(history: HistoryEntry[]) {
    // Find the most recent patient summary update
    const latestSummary = history.find(
      (entry) => entry.type === "PatientSummaryUpdate",
    );
    if (latestSummary) {
      this.patientState.updateActivePatientSummary(latestSummary.summary);
    } else {
      this.patientState.updateActivePatientSummary(null);
    }
  }

  /** Selects a patient, saving the current one's state first. */
  selectPatient(id: string) {
    if (this.selectedPatientId() === id) return;
    this.saveCurrentPatientState();
    this.selectedPatientId.set(id);
  }

  /** Reloads the current patient's most up-to-date state. Used to exit "review mode". */
  reloadCurrentPatient() {
    const patientId = this.selectedPatientId();
    if (!patientId) return;
    const patient = this.patients().find((p) => p.id === patientId);
    if (patient) {
      this.patientState.loadState(patient);
      this.geminiService.resetAIState();

      // Reload the latest analysis so the panel isn't empty after exiting review mode
      const latestAnalysis = patient.history.find(
        (entry) =>
          entry.type === "AnalysisRun" ||
          entry.type === "FinalizedPatientSummary",
      );
      if (
        latestAnalysis &&
        (latestAnalysis.type === "AnalysisRun" ||
          latestAnalysis.type === "FinalizedPatientSummary")
      ) {
        this.geminiService.loadArchivedAnalysis(latestAnalysis.report);
      }
    }
  }

  /** Creates a new patient record and selects it. */
  async createNewPatient() {
    this.saveCurrentPatientState();

    const firstName = "New";
    const lastName = "Patient";
    const dob = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const res = await createPatient(dataConnect, {
        firstName,
        lastName,
        dateOfBirth: dob,
        gender: "Other",
        vitalsHeartRate: 0,
        vitalsSystolicBP: 0,
        vitalsDiastolicBP: 0,
        currentSymptoms: []
      });

      if (res.data && res.data.patient_insert) {
        const newPatientId = res.data.patient_insert.id;
        const newPatient: IPatient = {
          id: newPatientId,
          name: `${firstName} ${lastName}`,
          age: 0,
          gender: "Other" as const,
          lastVisit: new Date().toISOString().split("T")[0].replace(/-/g, "."),
          patientGoals: "",
          preexistingConditions: [],
          vitals: { bp: "", hr: "", temp: "", spO2: "", weight: "", height: "" },
          issues: {},
          history: [],
          bookmarks: [],
        };

        // Add to the top of the list for immediate visibility
        this.patients.update((patients) => [newPatient, ...patients]);
        this.selectedPatientId.set(newPatientId);
      }
    } catch (err) {
      console.error('Error creating patient in SQL Connect:', err);
    }
  }

  /** Removes a patient record. */
  removePatient(id: string) {
    this.storage.deletePatient(id);
    const isActive = this.selectedPatientId() === id;

    this.patients.update((patients) => {
      const filtered = patients.filter((p) => p.id !== id);

      // If we removed the active patient, select the next available one or null
      if (isActive) {
        if (filtered.length > 0) {
          // Use setTimeout to avoid expression changed after checked and ensure safe state transition
          setTimeout(() => this.selectedPatientId.set(filtered[0].id));
        } else {
          setTimeout(() => this.selectedPatientId.set(null));
        }
      }

      return filtered;
    });
  }

  /** Imports a pre-built IPatient object (from JSON or FHIR import). */
  importPatient(patient: IPatient) {
    this.saveCurrentPatientState();
    this.patients.update((patients) => [patient, ...patients]);
    this.selectedPatientId.set(patient.id);
  }

  /** Updates the core demographic details of a patient. */
  updatePatientDetails(
    id: string,
    details: Partial<{
      name: string;
      age: number;
      gender: IPatient["gender"];
      patientGoals: string;
    }>,
  ) {
    this.patients.update((patients) =>
      patients.map((p) => (p.id === id ? { ...p, ...details } : p)),
    );
  }

  /** Adds a new entry to a patient's history. */
  addHistoryEntry(patientId: string, entry: HistoryEntry) {
    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        const updatedHistory = [entry, ...p.history];

        if (entry.type === "Visit") {
          return { ...p, history: updatedHistory, lastVisit: entry.date };
        }

        return { ...p, history: updatedHistory };
      }),
    );
  }

  /** Updates an existing entry in a patient's history, or adds it if it doesn't exist. */
  updateHistoryEntry(
    patientId: string,
    entry: HistoryEntry,
    matchFn: (e: HistoryEntry) => boolean,
  ) {
    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        const index = p.history.findIndex(matchFn);
        if (index === -1) {
          // Add if not found
          const updatedHistory = [entry, ...p.history];
          if (entry.type === "Visit") {
            return { ...p, history: updatedHistory, lastVisit: entry.date };
          }
          return { ...p, history: updatedHistory };
        }

        // Update existing
        const updatedHistory = [...p.history];
        updatedHistory[index] = entry;
        return { ...p, history: updatedHistory };
      }),
    );
  }

  /** Adds a bookmark to the currently selected patient. */
  addBookmark(bookmark: IBookmark) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    // Add the bookmark to the list
    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, bookmarks: [...p.bookmarks, bookmark] }
          : p,
      ),
    );

    // Add a corresponding history entry
    const historyEntry: HistoryEntry = {
      type: "BookmarkAdded",
      date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      summary: bookmark.title,
      bookmark: bookmark,
    };
    this.addHistoryEntry(patientId, historyEntry);
  }

  /** Removes a bookmark from the currently selected patient. */
  removeBookmark(url: string) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, bookmarks: p.bookmarks.filter((b) => b.url !== url) }
          : p,
      ),
    );
  }

  /** Injects a new rasterized diagnostic scan (like 3D markup) into the Vault */
  addScan(scan: IDiagnosticScan) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, scans: p.scans ? [scan, ...p.scans] : [scan] }
          : p,
      ),
    );
  }

  /** Updates an existing bookmark's metadata. */
  updateBookmark(url: string, updates: Partial<IBookmark>) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          bookmarks: p.bookmarks.map((b) =>
            b.url === url ? { ...b, ...updates } : b,
          ),
        };
      }),
    );
  }

  deleteNoteAndHistory(noteEntry: HistoryEntry) {
    if (noteEntry.type !== "NoteCreated") return;

    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        // Guard against prototype pollution / invalid keys
        const partId = noteEntry.partId;
        if (!partId || partId === '__proto__' || partId === 'constructor' || partId === 'prototype') {
          return p;
        }

        // Create a mutable copy of the patient
        const updatedPatient = { ...p, issues: { ...p.issues } };

        // 1. Remove note from issues
        const issuesForPart = updatedPatient.issues[partId] || [];
        const updatedIssuesForPart = issuesForPart.filter(
          (i) => i.noteId !== noteEntry.noteId,
        );

        if (updatedIssuesForPart.length > 0) {
          updatedPatient.issues[partId] = updatedIssuesForPart;
        } else {
          delete updatedPatient.issues[partId];
        }

        // 2. Remove entry from history
        updatedPatient.history = updatedPatient.history.filter((h) => {
          if (h.type === "NoteCreated" && h.noteId === noteEntry.noteId) {
            return false; // filter this one out
          }
          return true;
        });

        return updatedPatient;
      }),
    );
  }

  /** Loads the state from a past visit into the main app state for review. */
  loadArchivedVisit(
    patientId: string,
    visit: HistoryEntry,
    select?: { partId: string; noteId: string },
  ) {
    if (
      (visit.type !== "Visit" && visit.type !== "ChartArchived") ||
      !visit.state
    )
      return;

    this.saveCurrentPatientState();
    this.patientState.loadState(visit.state);
    this.geminiService.resetAIState();
    this.patientState.setViewingPastVisit(visit);

    // Load the analysis report associated with this visit's date (if one exists)
    const patient = this.patients().find((p) => p.id === patientId);
    if (patient) {
      const associatedAnalysis = patient.history.find(
        (entry) =>
          (entry.type === "AnalysisRun" ||
            entry.type === "FinalizedPatientSummary") &&
          entry.date === visit.date,
      );
      if (
        associatedAnalysis &&
        (associatedAnalysis.type === "AnalysisRun" ||
          associatedAnalysis.type === "FinalizedPatientSummary")
      ) {
        this.geminiService.loadArchivedAnalysis(associatedAnalysis.report);
      }
    }

    // After loading the historical state, select the specific note if requested.
    if (select) {
      this.patientState.selectPart(select.partId);
      this.patientState.selectNote(select.noteId);
    }
  }

  /** Loads the state from a past analysis into the main app state for review. */
  loadArchivedAnalysis(analysis: HistoryEntry) {
    if (analysis.type !== "AnalysisRun") return;
    this.saveCurrentPatientState();
    this.patientState.clearIssuesAndGoalsForReview();
    this.geminiService.loadArchivedAnalysis(analysis.report);
    this.patientState.setViewingPastVisit(analysis);
  }

  /** Ingests a standard SMART on FHIR R4 Bundle and maps it to the internal Patient list */
  ingestFhirBundle(bundle: any) {
    if (!bundle || bundle.resourceType !== 'Bundle' || !bundle.entry) return;

    let fhirPatientId = '';
    let fhirName = 'Epic Patient';
    let fhirAge = 0;
    let fhirGender = 'Unknown';

    // 1. Extract base demographics
    const patientResource = bundle.entry.find((e: any) => e.resource?.resourceType === 'Patient' || e.resource?.resourceType === 'Patient')?.resource;
    if (patientResource) {
        fhirPatientId = patientResource.id;
        if (patientResource.name?.[0]) {
            fhirName = `${patientResource.name[0].given?.join(' ') || ''} ${patientResource.name[0].family || ''}`.trim();
        }
        if (patientResource.birthDate) {
            const birthDate = new Date(patientResource.birthDate);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs); 
            fhirAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        fhirGender = patientResource.gender ? patientResource.gender.charAt(0).toUpperCase() + patientResource.gender.slice(1) : 'Unknown';
    }

    const conditions: string[] = [];
    const vitals: any = { bp: '', hr: '', temp: '', spO2: '', weight: '', height: '' };
    const scans: any[] = [];
    const medications: any[] = [];

    bundle.entry.forEach((entry: any) => {
        const resource = entry.resource;
        if (!resource) return;

        // Conditions
        if (resource.resourceType === 'Condition' && resource.code?.text) {
           if (!conditions.includes(resource.code.text)) {
               conditions.push(resource.code.text);
           }
        }

        // Medications
        if (resource.resourceType === 'MedicationRequest' && resource.medicationCodeableConcept?.text) {
            medications.push({
                id: resource.id || `med_${Date.now()}_${Math.random()}`,
                name: resource.medicationCodeableConcept.text,
                value: 'Prescribed'
            });
        }

        // IVitals
        if (resource.resourceType === 'Observation' && resource.category?.[0]?.coding?.[0]?.code === 'vital-signs') {
            const value = resource.valueQuantity ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}` : '';
            if (resource.code?.coding?.[0]?.code === '8310-5') vitals.temp = value; 
            if (resource.code?.coding?.[0]?.code === '8867-4') vitals.hr = value;   
            if (resource.code?.coding?.[0]?.code === '2708-6') vitals.spO2 = value; 
            
            if (resource.code?.coding?.[0]?.code === '85354-9' && resource.component) {
                const systolic = resource.component.find((c: any) => c.code?.coding?.[0]?.code === '8480-6')?.valueQuantity?.value;
                const diastolic = resource.component.find((c: any) => c.code?.coding?.[0]?.code === '8462-4')?.valueQuantity?.value;
                if (systolic && diastolic) vitals.bp = `${systolic}/${diastolic}`;
            }
        }

        // Diagnostic Reports
        if (resource.resourceType === 'DiagnosticReport') {
            scans.push({
                id: resource.id || `scan_${Math.random()}`,
                type: 'External FHIR Report',
                title: resource.code?.text || 'Diagnostic Report',
                date: resource.effectiveDateTime ? resource.effectiveDateTime.split('T')[0].replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                bodyPartId: 'unknown',
                description: resource.presentedForm?.[0]?.data ? atob(resource.presentedForm[0].data) : 'Imported via SMART on FHIR',
                status: 'Reviewed'
            });
        }
    });

    const newPatient: IPatient = {
        id: `epic_${fhirPatientId || Date.now()}`,
        name: fhirName,
        age: fhirAge,
        gender: fhirGender as "Male" | "Female" | "Non-binary" | "Other",
        lastVisit: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        preexistingConditions: conditions,
        patientGoals: "Imported via Epic MyChart Integration",
        vitals: vitals,
        oxidativeStressMarkers: [],
        antioxidantSources: [],
        medications: medications,
        issues: {},
        history: [{
           type: "Visit",
           date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
           summary: "SMART on FHIR Data Import",
           state: {} as any
        }],
        bookmarks: [],
        scans: scans
    };

    this.patients.update(list => [newPatient, ...list]);
    this.selectPatient(newPatient.id);
  }

  /** Synchronizes the current patient list with the Node.js backend. */
  async syncToCloud(): Promise<boolean> {
    if (!this.network.isOnline()) {
        console.warn('[PatientManagementService] Cannot sync to cloud while offline. State is safely stored locally.');
        return false;
    }

    this.saveCurrentPatientState(); // Ensure the latest state is saved
    try {
      const patientsToSync = this.patients();
      // Include auth header if PATIENTS_SECRET was surfaced via /api/config or env
      const secret = (window as any).__PATIENTS_SECRET__ || '';
      const headers: Record<string, string> = secret
        ? { Authorization: `Bearer ${secret}` }
        : {};
      await firstValueFrom(this.http.post('/api/patients', patientsToSync, { headers }));
      console.log('[PatientManagementService] Successfully synced to cloud');
      return true;
    } catch (error) {
      console.error('[PatientManagementService] Error syncing to cloud', error);
      return false;
    }
  }

  /** Persists the current form state to the patient object in the list. */
  private saveCurrentPatientState() {
    const currentId = this.selectedPatientId();
    if (!currentId) return;

    const currentState = this.patientState.getCurrentState();
    this.patients.update((patients) =>
      patients.map((p) => (p.id === currentId ? { ...p, ...currentState } : p)),
    );
  }
}

import { IPatient } from '../services/patient.types';

export const p_phil_gear: IPatient = {
  id: "p_phil_gear",
  name: "Phil Gear",
  age: 42,
  gender: "Male",
  lastVisit: "2026.05.20",
  preexistingConditions: ["Hypertension", "Mild Sleep Apnea", "Google Health Integration"],
  patientGoals: "Optimize metabolic health, synchronize all personal biometrics from Google Health Connect, and reduce sleep latency.",
  tcmIntake: {
    tongueColor: "pink",
    tongueCoating: "thin-white",
    pulseQuality: "normal",
    thermalPreference: "neutral",
    sweatPattern: "normal",
    tasteInMouth: "normal",
    tcmPattern: "Zang-Fu Balance with Mild Liver Qi Constriction (Executive Stress)"
  },
  ayurvedicIntake: {
    prakritiVata: 3,
    prakritiPitta: 5,
    prakritiKapha: 3,
    vikritiVata: 4,
    vikritiPitta: 6,
    vikritiKapha: 3,
    agniType: "samagni",
    amaScore: 1.8,
    nadiPulseType: "frog-pitta",
    ayurvedicImbalance: "Samagni Metabolic Balance with Mild Pitta Exertion"
  },
  vitals: {
    bp: "122/82",
    hr: "68",
    temp: "98.6°F",
    spO2: "98%",
    weight: "178 lbs",
    height: "5'10\"",
    vitD3: "32 ng/mL",
    magnesium: "2.1 mg/dL",
    b12: "580 pg/mL",
    zinc: "92 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "Malondialdehyde (MDA)", value: "1.8 μmol/L (Normal)" },
    { id: "2", name: "hsCRP", value: "0.9 mg/L (Optimal)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Glutathione (GSH)", value: "2.4 μmol/g Hb (Optimal)" },
    { id: "2", name: "CoQ10", value: "1.1 μg/mL (Normal)" }
  ],
  medications: [
    { id: "1", name: "Lisinopril", value: "10mg Daily" },
    { id: "2", name: "Magnesium Glycinate", value: "400mg PM" }
  ],
  biometricHistory: [
    { timestamp: "2026-05-18T08:00:00Z", type: "hr", value: "70" },
    { timestamp: "2026-05-19T08:00:00Z", type: "hr", value: "69" },
    { timestamp: "2026-05-20T08:00:00Z", type: "hr", value: "68" },
    { timestamp: "2026-05-20T08:00:00Z", type: "bp", value: "122/82" }
  ],
  issues: {
    head: [
      {
        id: "head",
        noteId: "note_phil_head_1",
        name: "Head & Neck",
        painLevel: 2,
        description: "Mild tension headaches occasionally in the evening, related to screens and desk posture.",
        symptoms: [
          { name: "Occidental tension headache", type: "Neurological", verified: true, timeline: "Episodic" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "2026.05.20",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview":
          "### Clinical Assessment\nPhil presents with mild tension headaches and sleep latency complaints. Focus is on optimization of metabolic pathways, screen time hygiene, and real-time biometric telemetry tracking.\n\n### Priority List\n- **Sleep Latency & BMAL1 Rhythm**: Circadian realignment to achieve rapid sleep onset (< 20 mins).\n- **Autonomic Vagal Regulation**: 0.1 Hz resonant breathing for sympathetic dampening.\n- **Biometric Integration**: Google Health Connect and continuous telemetry monitoring.\n\n### Goals\n- **Short-term**: Reduce sleep latency to < 20 minutes.\n- **Long-term**: Normalize daily vitals and maintain optimal circadian sync.",
        "Functional Protocols":
          "### Diagnostic Workup & Lifestyle\n- Implement blue-light blocking protocols after 8:00 PM.\n- Morning sunlight exposure (10-15 minutes) within 30 minutes of waking.\n- 0.1 Hz vagal resonant breathing session for 10 minutes before sleep.",
        "Nutrition":
          "### Nutritional Interventions\n- Emphasize magnesium-rich foods (dark leafy greens, pumpkin seeds).\n- Hydrate with electrolytes during training sessions.\n- Incorporate 7-day Chrono-Nutrition fast-break porridge and afternoon dark cacao nibs.",
        "Monitoring & Follow-up":
          "### Immediate (24-72 hours) & Clinical Tracking\n- Monitor daily resting heart rate and sleep cycles using Fitbit/Google Health Connect.\n- Follow up in 4 weeks for HRV spectral power density review.",
        "Patient Education":
          "### Understanding Your Health Path\nWe are focusing on tuning your body's daily rhythms, syncing Fitbit metrics, and optimizing cellular nutrients to resolve evening tension.",
        "Precision Nutrients":
          "### Biomarker Matrix\n\n- **Magnesium**: Sub-optimal (ATP Synthesis / NMDA)\n- **Vitamin D3**: Sub-optimal (Immune / Bone)\n- **Vitamin B12**: Optimal (Methylation)\n- **Zinc**: Optimal (Immune / Hormones)",
        "PhysioNet Telemetry":
          "### PhysioNet 2026 Digital Signal & Electrophysiology Summary\nIntegrated EDF/PhysioNet waveform metrics captured from high-frequency BLE telemetry sensors and continuous multi-lead ECG monitoring.\n\n### Electrocardiographic Waveform Morphology\n- **QRS Interval Duration**: 88 ms (Normal baseline: < 120 ms).\n- **ST-Segment**: Neutral ST morphology across Lead II, V2, V5 (+0.02 mV deviation).\n- **QTc Interval (Fridericia)**: 412 ms (Normal baseline: < 450 ms).\n\n### Heart Rate Variability (HRV) Spectral Power Density\n- **LF/HF Ratio**: 1.25 (Balanced autonomic tone)\n- **RMSSD**: 48 ms (Good parasympathetic rebound)"
      }
    },
    {
      type: "Y-BOCsAssessment",
      date: "2026.05.20",
      summary: "Y-BOCS Assessment completed: Subclinical OCD score 4/40",
      assessment: {
        totalScore: 4,
        severityCategory: "Subclinical",
        dateCreated: "2026-05-20T10:00:00Z"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_phil_1",
      title: "Polysomnography Sleep Study",
      type: "Lab Report",
      date: "2026.04.15",
      description: "Mild sleep latency elevation; zero central sleep apnea. AHI 4.2/hr (Mild), Sleep Efficiency 88%.",
      status: "Reviewed"
    }
  ]
};

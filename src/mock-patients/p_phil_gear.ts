import { IPatient } from '../services/patient.types';

export const p_phil_gear: IPatient = {
  id: "p_phil_gear",
  name: "Phil Gear",
  age: 42,
  gender: "Male",
  lastVisit: "2026.05.20",
  preexistingConditions: ["Hypertension", "Mild Sleep Apnea", "Google Health Integration"],
  patientGoals: "Optimize metabolic health, synchronize all personal biometrics from Google Health Connect, and reduce sleep latency.",
  vitals: {
    bp: "122/82",
    hr: "68",
    temp: "98.6°F",
    spO2: "98%",
    weight: "178 lbs",
    height: "5'10\""
  },
  oxidativeStressMarkers: [],
  antioxidantSources: [],
  medications: [
    { id: "1", name: "Lisinopril", value: "10mg Daily" }
  ],
  biometricHistory: [
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
        symptoms: []
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
          "### Clinical Assessment\nPhil presents with mild tension headaches and sleep latency complaints. Focus is on optimization of metabolic pathways, screen time hygiene, and real-time biometric telemetry tracking.\n\n### Goals\n*   **Short-term**: Reduce sleep latency to < 20 minutes.\n*   **Long-term**: Normalize daily vitals and maintain optimal circadian sync.",
        "Functional Protocols":
          "### Diagnostic Workup & Lifestyle\n- Implement blue-light blocking protocols after 8:00 PM.\n- Morning sunlight exposure (10-15 minutes) within 30 minutes of waking.",
        "Nutrition":
          "### Nutritional Interventions\n- Emphasize magnesium-rich foods (dark leafy greens, pumpkin seeds).\n- Hydrate with electrolytes during training sessions.",
        "Monitoring & Follow-up":
          "### Immediate (24-72 hours) & Clinical Tracking\n- Monitor daily resting heart rate and sleep cycles using Fitbit/Google Health Connect.\n- Follow up in 4 weeks.",
        "Patient Education":
          "### Understanding Your Health Path\nWe are focusing on tuning your body's daily rhythms, syncing Fitbit metrics, and optimizing cellular nutrients to resolve evening tension.",
        "Precision Nutrients":
          "### Biomarker Matrix\n\n- **Magnesium**: Sub-optimal (ATP Synthesis / NMDA)\n- **Vitamin D3**: Sub-optimal (Immune / Bone)\n- **Vitamin B12**: Optimal (Methylation)\n- **Zinc**: Optimal (Immune / Hormones)"
      }
    }
  ],
  bookmarks: [],
  scans: []
};

import { IPatient } from '../services/patient.types';

export const p005: IPatient = {
  "id": "p005",
  "name": "CDC Sentinel",
  "age": 78,
  "gender": "Female",
  "lastVisit": "2026.03.12",
  "preexistingConditions": [
    "Hypertensive Heart Disease",
    "Type 2 Diabetes Mellitus (T2DM)",
    "Nephritis / Chronic Kidney Disease (Stage 3b)",
    "Mild Cognitive Impairment (Early Alzheimer's)"
  ],
  "patientGoals": "Manage blood pressure, optimize glycemic status, protect renal clearance, and support cognitive function and fall prevention.",
  "vitals": {
    "bp": "142/78",
    "hr": "68",
    "temp": "98.4°F",
    "spO2": "95%",
    "weight": "162 lbs",
    "height": "5'4\""
  },
  "issues": {
    "chest": [
      {
        "id": "chest",
        "noteId": "note_p005_chest_1",
        "name": "Cardiovascular Stress (Hypertensive Heart Disease)",
        "painLevel": 3,
        "description": "Essential hypertension with signs of left ventricular strain. Reports occasional heart palpitations and mild breathlessness when walking.",
        "symptoms": [
          {
            "name": "Mild exertional breathlessness",
            "type": "Respiratory",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Intermittent palpitations",
            "type": "Cardiovascular",
            "verified": true,
            "timeline": "Chronic"
          }
        ]
      }
    ],
    "abdomen": [
      {
        "id": "abdomen",
        "noteId": "note_p005_abdomen_1",
        "name": "Metabolic-Renal Insufficiency",
        "painLevel": 2,
        "description": "Comorbid T2DM and nephritis (Stage 3b CKD, eGFR 44). Experiencing mild bilateral lower limb swelling due to fluid retention.",
        "symptoms": [
          {
            "name": "Mild lower extremity swelling",
            "type": "Renal",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Frequent urination",
            "type": "Metabolic",
            "verified": true,
            "timeline": "Chronic"
          }
        ]
      }
    ],
    "head": [
      {
        "id": "head",
        "noteId": "note_p005_head_1",
        "name": "Neurocognitive Health (Early Alzheimer's Profile)",
        "painLevel": 1,
        "description": "Evaluated for mild cognitive decline. Demonstrates difficulties with word-finding, short-term memory retrieval, and orientation in complex layouts.",
        "symptoms": [
          {
            "name": "Word-finding difficulties",
            "type": "Neurological",
            "verified": true,
            "timeline": "Progressive"
          },
          {
            "name": "Subjective memory loss",
            "type": "Neurological",
            "verified": true,
            "timeline": "Progressive"
          }
        ]
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.25",
      "summary": "CDC Sentinel Cardiovascular and Neurodegenerative Screening",
      "report": {
        "Summary Overview": "### Clinical Assessment\nCDC Sentinel represents the major chronic disease burdens in the United States, including heart disease, stroke risk, diabetes, chronic kidney disease (nephritis), and Alzheimer's disease. The patient requires a structured approach balancing blood pressure management, blood glucose regulation, renoprotective diet, and neuro-supportive nutrients.\n\n### Priority List\n*   **Blood Pressure Control**: Strict target of < 130/80 mmHg to reduce stroke and kidney failure risk.\n*   **Cognitive Preservation**: Support acetylcholine synthesis and reduce neuroinflammation.\n*   **Kidney Clearance Support**: Reduce glomerular pressure and control fluid accumulation.\n\n### Plan of Care\n*   Prescribe low-glycemic, anti-inflammatory, low-sodium dietary protocol (DASH diet variant).\n*   Introduce mild daily balance and cognitive exercise (Tai Chi, brain exercises).\n*   Monitor blood pressure and cognitive performance indicators monthly.\n\n### Goals\n*   **Short-term (2 weeks)**: Bring BP to < 135/80; reduce ankle edema by 50%.\n*   **Long-term (3 months)**: Stabilize eGFR above 40 mL/min; maintain baseline cognitive scores (MMSE/MOCA); HbA1c < 7.0%.",
        "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Scale down dietary sodium intake to 1500mg daily.\n*   Begin daily blood pressure tracking in the morning and evening.\n*   Begin supplementation with clean Omega-3 fatty acids for cognitive and lipid support.\n\n### Foundation (Diet & Lifestyle)\n*   **Diet**: Plant-forward DASH diet, emphasizing green leafy vegetables, healthy fats, and clean protein (< 0.8g/kg due to CKD).\n*   **Exercise**: 15 minutes of Tai Chi daily for balance, core strength, and mindfulness.\n*   **Cognitive Activity**: Word puzzles and reading daily for 20 minutes.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Phosphatidylserine | 200mg | PM | Neuro-membrane support and cortisol modulation |\n| Alpha-GPC | 300mg | AM | Acetylcholine precursor for cognitive performance |\n| Vitamin D3 + K2 | 2000 IU | AM | Cardiovascular and bone density support |\n| CoQ10 | 100mg | AM | Mitigate left ventricular strain |",
        "Nutrition": "### Biochemical Assessment\nNutritional management focuses on reducing vascular inflammation, mitigating glycemic excursions, and avoiding high renal excretion stress.\n\n### Nutrition Targets\n*   **Renal Integrity**: Restrict high-phosphorus foods and monitor potassium to keep serum values stable.\n*   **Neuroprotection**: High-antioxidant foods (blueberries, walnuts) to limit brain oxidative stress.\n*   **Vascular Health**: High dietary fiber to optimize bowel transit and support lipid levels.\n\n### Dietary Adjustments\nIncrease intake of celery and beets (nitrates) to support vessel relaxation. Strictly avoid high-fructose corn syrup, trans fats, and excess dietary sodium.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Set up weekly pill planner to ensure medication adherence.\n2.  Monitor daily morning weights (escalate if weight gains > 3 lbs in 48 hours, suggesting fluid retention).\n3.  Follow up in 4 weeks for renal panels and blood pressure assessment.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Blood Pressure | < 130/80 | Daily | > 150/90 on consecutive readings |\n| Morning Weight | +/- 2 lbs | Daily | > 3 lbs gain in 48 hours |\n| MMSE Score | >= 25/30 | Every 3 months | Drop in score > 2 points |",
        "Patient Education": "### Understanding Your Conditions\nManaging your health involves a partnership between your heart, your kidneys, and your brain. When we keep your blood pressure low, we protect the blood vessels in your kidneys and the blood vessels in your brain. This prevents further kidney strain and helps keep your memory sharp.\n\n### What Was Found\n*   **Hypertension**: Your heart is pumping against high resistance, causing strain.\n*   **Renal Strain**: Your kidney filters are working harder, which can cause you to hold onto extra fluid (ankle swelling).\n*   **Memory Changes**: The brain's messaging centers need extra support to maintain memory and processing speeds.\n\n### Current Plan\n*   **DASH Nutrition**: Eating plenty of fresh vegetables, limiting salt, and enjoying healthy fats.\n*   **Daily Balance Exercises**: Tai Chi helps build strong joints and improves balance to prevent falls.\n*   **Brain Workouts**: Daily puzzles to stimulate nerve pathways."
      }
    },
    {
      "type": "Visit",
      "date": "2026.03.12",
      "summary": "Review of US-specific mortality risks. Identified mild left-ventricular overload, renal filtration strain, and subjective cognitive decline.",
      "state": {
        "patientGoals": "Evaluate US mortality risks and complex multimorbidity presentation.",
        "vitals": {
          "bp": "142/78",
          "hr": "68",
          "temp": "98.4°F",
          "spO2": "95%",
          "weight": "162 lbs",
          "height": "5'4\""
        },
        "issues": {}
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};

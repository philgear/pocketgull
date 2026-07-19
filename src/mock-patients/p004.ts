import { IPatient } from '../services/patient.types';

export const p004: IPatient = {
  "id": "p004",
  "name": "Global Sentinel",
  "age": 72,
  "gender": "Male",
  "lastVisit": "2026.03.12",
  "preexistingConditions": [
    "Ischemic Heart Disease (IHD)",
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Type 2 Diabetes Mellitus (T2DM)",
    "Chronic Kidney Disease (CKD) Stage 3a"
  ],
  "patientGoals": "Optimize oxygenation, stabilize blood glucose, manage exertional chest tightness, and protect renal function.",
  "vitals": {
    "bp": "138/82",
    "hr": "74",
    "temp": "98.6°F",
    "spO2": "92%",
    "weight": "172 lbs",
    "height": "5'9\""
  },
  "issues": {
    "chest": [
      {
        "id": "chest",
        "noteId": "note_p004_chest_1",
        "name": "Cardiopulmonary Strain (IHD & COPD)",
        "painLevel": 4,
        "description": "Comorbid ischemic heart disease and moderate COPD. Reports mild shortness of breath on climbing stairs and chronic morning cough.",
        "symptoms": [
          {
            "name": "Dyspnea on exertion",
            "type": "Respiratory",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Exertional chest tightness",
            "type": "Cardiovascular",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Chronic productive cough",
            "type": "Respiratory",
            "verified": true,
            "timeline": "Chronic"
          }
        ]
      }
    ],
    "abdomen": [
      {
        "id": "abdomen",
        "noteId": "note_p004_abdomen_1",
        "name": "Cardiometabolic & Renal Syndrome",
        "painLevel": 2,
        "description": "Longstanding type 2 diabetes with eGFR of 52 mL/min/1.73m² (Stage 3a CKD). Patient shows signs of mild fluid retention.",
        "symptoms": [
          {
            "name": "Polyuria & mild polydipsia",
            "type": "Metabolic",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Bilateral ankle edema",
            "type": "Renal",
            "verified": true,
            "timeline": "Intermittent"
          }
        ]
      }
    ],
    "head": [
      {
        "id": "head",
        "noteId": "note_p004_head_1",
        "name": "Cerebrovascular & Cognitive Risk",
        "painLevel": 1,
        "description": "History of transient ischemic attack (TIA) in 2023. Reports mild subjective cognitive decline and difficulty with short-term recall.",
        "symptoms": [
          {
            "name": "Subjective memory lapses",
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
      "summary": "Cardiopulmonary and Renal Protective Assessment",
      "report": {
        "Summary Overview": "### Clinical Assessment\nGlobal Sentinel represents a classic complex multi-morbid presentation reflecting the leading causes of global mortality: cardiovascular disease (IHD), chronic respiratory disease (COPD), metabolic disease (T2DM), and renal impairment (CKD Stage 3a). The primary therapeutic objectives are to mitigate cardiovascular risk, improve pulmonary function/oxygenation, achieve glycemic control, and slow the decline of kidney function.\n\n### Priority List\n*   **Cardiopulmonary Stabilization**: Manage exertional dyspnea and optimize coronary perfusion.\n*   **Renoprotection**: Control blood pressure and glycemic markers to preserve eGFR.\n*   **Metabolic Optimization**: Improve insulin sensitivity and lower HbA1c below 7.0%.\n\n### Plan of Care\n*   Implement low-sodium, low-glycemic, kidney-friendly nutritional protocol.\n*   Encourage daily pulmonary clearance exercises and structured Zone 1-2 physical activity as tolerated.\n*   Monitor daily vitals (BP, SpO2, blood glucose) closely.\n\n### Goals\n*   **Short-term (2 weeks)**: Stabilize resting SpO2 at or above 93%; blood glucose under 140 mg/dL fasting.\n*   **Long-term (3 months)**: Maintain eGFR > 50 mL/min; reduce HbA1c to < 6.8%; eliminate exertional chest tightness.",
        "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Initiate daily home pulse oximetry tracking (morning and post-exertion).\n*   Transition to a potassium-balanced, low-glycemic whole foods plan.\n*   Establish a diaphragmatic breathing schedule (5 minutes, three times daily).\n\n### Foundation (Diet & Lifestyle)\n*   **Diet**: Whole-food plant-forward, restricting refined carbohydrates and maintaining moderate protein intake (0.8g/kg) to support renal filtration.\n*   **Exercise**: 20 minutes of daily light walking; avoid heavy isometric straining to keep BP stable.\n*   **Sleep**: Elevate head of bed by 15 degrees to optimize nighttime oxygenation and reduce morning cough.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Coenzyme Q10 (Ubiquinol) | 200mg | With breakfast | Mitochondrial & myocardial support |\n| Magnesium Malate | 300mg | With dinner | Vascular smooth muscle relaxation, insulin sensitivity |\n| N-Acetyl Cysteine (NAC) | 600mg | Morning | Mucolytic support for chronic cough & COPD |",
        "Nutrition": "### Biochemical Assessment\nOxidative stress, endothelial dysfunction, and chronic low-grade inflammation are driving the progression of both cardiovascular and renal pathology. Dietary adjustments must balance glycemic load with renal phosphorus/potassium management.\n\n### Nutrition Targets\n*   **Endothelial Support**: Nitrate-rich vegetables (arugula, beets) in moderation to support nitric oxide synthesis.\n*   **Glycemic Control**: High-fiber, complex carbohydrates to stabilize blood glucose curves.\n*   **Renal Sparing**: Limit sodium to < 2000mg/day and control protein density.\n\n### Dietary Adjustments\nEmphasize steamed cruciferous vegetables, garlic, and onions to support endogenous detoxification. Integrate small portions of healthy fats (olive oil, avocados) while avoiding processed foods and trans-fats.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Check fasting blood glucose and post-prandial readings daily.\n2.  Log blood pressure twice daily (target < 130/80).\n3.  Follow up in 4 weeks with basic renal panel (BUN/creatinine) and electrolytes.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| resting SpO2 | >= 93% | Daily | Drop below 90% at rest |\n| Blood Pressure | < 130/80 mmHg | Twice daily | BP > 150/95 mmHg on 2 readings |\n| Fasting Glucose | 90-130 mg/dL | Daily | Glucose > 200 mg/dL persistently |\n\n### Long-term Trajectory (6+ months)\nAnnual cardiology consultation and semi-annual nephrology follow-up. Target stable eGFR and stable pulmonary function tests (PFTs).",
        "Patient Education": "### Understanding Your Conditions\nYour body's cardiovascular, respiratory, and metabolic systems are closely interconnected. A strain on one (like your lungs) can affect the others (like your heart and kidneys). By managing your blood sugar and blood pressure, you are protecting both your heart and your kidneys.\n\n### What Was Found\n*   **Reduced Lung Capacity**: Your airways have chronic irritation, which is why your oxygen levels sit slightly lower.\n*   **Kidney Stress**: Your kidneys are filtering at a slightly reduced rate, requiring us to avoid excessive protein and sodium.\n*   **Metabolic Slowdown**: Your cells are resistant to insulin, causing glucose to remain in the blood rather than being used for energy.\n\n### Current Plan\n*   **Gentle Breathing Exercises**: To maximize lung volume and support oxygenation.\n*   **Renal-Protective Diet**: Reducing salt and eating clean to take the pressure off your kidneys.\n*   **Gentle Movement**: Walking daily to maintain cardiovascular fitness without overloading the heart.",
        "Precision Nutrients": "### Biochemical & Biomarker Matrix\nEvaluation of renal and cardiovascular co-factors highlights the need for cardiovascular support that does not stress renal clearance.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| eGFR | 52 mL/min/1.73m² | Renal Clearance (Stage 3a) |\n| HbA1c | 7.2% | Glycated Hemoglobin (Sub-optimal) |\n| Serum Potassium | 4.4 mEq/L | Electrolyte Balance (Normal) |\n\n### Key Interventions\n- **NAC (600mg)**: Thin mucus secretions and support pulmonary pathways.\n- **CoQ10 (200mg)**: Promote cellular energy production within myocardial tissues.\n- **Magnesium Malate (300mg)**: Support insulin action and blood vessel relaxation."
      }
    },
    {
      "type": "Visit",
      "date": "2026.03.12",
      "summary": "Initial evaluation of cardiopulmonary, metabolic, and renal multimorbidity. Vitals stable but showing sub-optimal oxygenation and mild hypertension.",
      "state": {
        "patientGoals": "Evaluate global mortality risks and complex multi-morbid presentation.",
        "vitals": {
          "bp": "138/82",
          "hr": "74",
          "temp": "98.6°F",
          "spO2": "92%",
          "weight": "172 lbs",
          "height": "5'9\""
        },
        "issues": {}
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};

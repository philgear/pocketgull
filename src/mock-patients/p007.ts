import { IPatient } from '../services/patient.types';

export const p007: IPatient = {
  "id": "p007",
  "name": "Maternal Sentinel",
  "age": 28,
  "gender": "Female",
  "lastVisit": "2026.03.12",
  "preexistingConditions": [
    "Gestational Hypertension",
    "Primigravida (32 Weeks Gestation)",
    "Iron-Deficiency Anemia of Pregnancy"
  ],
  "patientGoals": "Optimize blood pressure, correct anemia, track fetal movements, and establish a postpartum hemorrhage prevention plan.",
  "vitals": {
    "bp": "135/85",
    "hr": "90",
    "temp": "98.8°F",
    "spO2": "98%",
    "weight": "165 lbs",
    "height": "5'6\""
  },
  "issues": {
    "pelvis": [
      {
        "id": "pelvis",
        "noteId": "note_p007_pelvis_1",
        "name": "Uterine & Gestational Status (32 Weeks)",
        "painLevel": 5,
        "description": "Third-trimester pregnancy with borderline gestational hypertension (BP 135/85). Undergoing regular fetal kick count tracking and growth scans. Experiencing intermittent Braxton Hicks contractions.",
        "symptoms": [
          {
            "name": "Borderline gestational hypertension",
            "type": "Obstetric/Cardiovascular",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Intermittent Braxton Hicks contractions",
            "type": "Obstetric",
            "verified": true,
            "timeline": "Intermittent"
          }
        ]
      }
    ],
    "full_body": [
      {
        "id": "full_body",
        "noteId": "note_p007_full_1",
        "name": "Iron-Deficiency Anemia & Fatigue",
        "painLevel": 4,
        "description": "Presents with moderate microcytic anemia (Hemoglobin 9.8 g/dL). Reports systemic fatigue, cold sensitivity, and mild orthostatic lightheadedness when standing up quickly.",
        "symptoms": [
          {
            "name": "Maternal fatigue",
            "type": "Hematologic",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Orthostatic lightheadedness",
            "type": "Cardiovascular",
            "verified": true,
            "timeline": "Chronic"
          }
        ]
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.25",
      "summary": "Maternal Sentinel Third-Trimester Risk Assessment",
      "report": {
        "Summary Overview": "### Clinical Assessment\nMaternal Sentinel is a 28-year-old female at 32 weeks gestation presenting with gestational hypertension and iron deficiency anemia. The main clinical priorities are to control blood pressure to prevent progression to pre-eclampsia/eclampsia, correct maternal iron levels to prevent postpartum hemorrhage complications, and optimize fetal developmental nutrients.\n\n### Priority List\n*   **Pre-eclampsia Surveillance**: Monitor blood pressure and scan for signs like severe headaches, visual disturbances, or right upper quadrant pain.\n*   **Hematologic Recovery**: Replete iron reserves safely to optimize oxygen delivery and build a buffer against delivery blood loss.\n*   **Vascular & Endothelial Health**: Maintain maternal blood vessel elasticity and support uterine blood flow.\n\n### Plan of Care\n*   Implement low-stress lifestyle with daily rest periods; monitor blood pressure twice daily.\n*   Recommend gentle prenatal yoga and pelvic floor preparation exercises.\n*   Optimize iron intake through dietary and supplemental routes; take iron with Vitamin C to enhance absorption.\n\n### Goals\n*   **Short-term (2 weeks)**: Maintain BP below 140/90 mmHg; increase hemoglobin above 10.5 g/dL.\n*   **Long-term (Birth)**: Safe delivery at term (39-40 weeks) with minimal postpartum blood loss and healthy birth weight.",
        "Functional Protocols": "### Immediate Actions (To start within 24 hours)\n*   Establish a home BP logging routine (morning and afternoon).\n*   Verify fetal movement count daily (10 movements within 2 hours).\n*   Begin prenatal-safe iron supplementation with Vitamin C.\n\n### Foundation (Diet & Lifestyle)\n*   **Diet**: Mediterranean-style diet high in organic iron sources (spinach, lentils, clean grass-fed beef in moderation) paired with citrus fruits. Ensure adequate protein (1.2g/kg) and hydration (80-100 oz of water daily).\n*   **Activity**: Daily 15-20 minute gentle walk; avoid overheating or intense exercises.\n*   **Rest**: Sleep on the left side to maximize uterine blood flow and kidney filtration.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Iron Bisglycinate | 25mg | PM, empty stomach | Highly absorbable iron, gentle on stomach |\n| Methylated Prenatal Vitamin | 1 daily | With breakfast | Comprehensive fetal co-factors |\n| Magnesium Glycinate | 300mg | Bedtime | Support vascular relaxation and reduce leg cramps |\n| Vitamin C | 500mg | PM, with Iron | Optimize non-heme iron absorption |",
        "Nutrition": "### Biochemical Assessment\nGestational physiology requires a significant increase in red blood cell volume. Lack of adequate iron reserves leads to tissue hypoxia and maternal exhaustion, while endothelial stress raises pre-eclampsia risk.\n\n### Nutrition Targets\n*   **Erythropoiesis Support**: Iron, Folate, and B12 are critical co-factors for RBC production.\n*   **Vascular Smooth Muscle Support**: Magnesium, Calcium, and Potassium support proper vascular tone.\n*   **Hydration Density**: Electrolyte balance prevents rapid blood volume contractions.\n\n### Dietary Adjustments\nEmphasize iron-rich plant foods combined with ascorbic acid. Limit simple sugars and processed foods that trigger systemic vascular inflammation.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Log daily fetal kick counts.\n2.  Log daily blood pressures.\n3.  Follow up in 2 weeks for complete blood count (CBC) and urine protein check.\n\n### Ongoing (Month 8 to Delivery)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Blood Pressure | < 140/90 | Twice daily | BP >= 140/90 or headache/vision change |\n| Fetal Kicks | >= 10 in 2 hrs | Daily | < 10 kicks in 2 hours (go to triage) |\n| Urine Protein | Negative | Every 2 weeks | Traces or +1 protein |"
      }
    },
    {
      "type": "Visit",
      "date": "2026.03.12",
      "summary": "Third-trimester evaluation of maternal health. Identified borderline gestational hypertension and moderate iron deficiency anemia. Fetal movements normal.",
      "state": {
        "patientGoals": "Evaluate global maternal mortality risks.",
        "vitals": {
          "bp": "135/85",
          "hr": "90",
          "temp": "98.8°F",
          "spO2": "98%",
          "weight": "165 lbs",
          "height": "5'6\""
        },
        "issues": {}
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};

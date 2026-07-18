import { IPatient } from '../services/patient.types';

export const p003: IPatient = {
  "id": "p003",
  "name": "William Henderson",
  "age": 81,
  "gender": "Male",
  "lastVisit": "2024.12.05",
  "preexistingConditions": [
    "Ischemic Heart Disease",
    "Chronic Kidney Disease",
    "Mild Cognitive Impairment / Early Alzheimer's",
    "Osteoarthritis",
    "Fall Risk"
  ],
  "patientGoals": "Family requested evaluation for increased confusion and recent fall at home.",
  "vitals": {
    "bp": "135/82",
    "hr": "68",
    "temp": "97.9°F",
    "spO2": "97%",
    "weight": "162 lbs",
    "height": "5'9\""
  },
  "oxidativeStressMarkers": [
    {
      "id": "1",
      "name": "8-OHdG",
      "value": "15 ng/mg creatinine"
    },
    {
      "id": "2",
      "name": "Lipid Peroxides",
      "value": "12 nmol/mL"
    }
  ],
  "antioxidantSources": [
    {
      "id": "1",
      "name": "Alpha-Tocopherol",
      "value": "11.5 mg/L"
    }
  ],
  "medications": [
    {
      "id": "1",
      "name": "Donepezil",
      "value": "5mg Daily"
    },
    {
      "id": "2",
      "name": "Aspirin",
      "value": "81mg Daily"
    },
    {
      "id": "3",
      "name": "Furosemide",
      "value": "20mg Daily"
    },
    {
      "id": "4",
      "name": "Acetaminophen",
      "value": "500mg PRN OA Pain"
    }
  ],
  "issues": {
    "head": [
      {
        "id": "head",
        "noteId": "note_p003_head_1",
        "name": "Brain & Cognition",
        "painLevel": 0,
        "description": "Daughter reports patient got lost returning from the grocery store yesterday. Requires prompting for ADLs. MoCA score: 18/30.",
        "symptoms": []
      }
    ],
    "r_arm": [
      {
        "id": "r_arm",
        "noteId": "note_p003_arm_1",
        "name": "Right Arm / Wrist",
        "painLevel": 4,
        "description": "Bruising and tenderness from mechanical fall two days ago. X-ray negative for fracture.",
        "symptoms": []
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.25",
      "summary": "Comprehensive Clinical Analysis",
      "report": {
        "Summary Overview": "### Clinical Assessment\nWilliam Henderson presents with a complex clinical picture primarily characterized by Brain & Cognition, Right Arm / Wrist. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
        "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
        "Nutrition": "### Biochemical Assessment\nAnalysis of William's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. William should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
        "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        "Precision Nutrients": "### Biochemical & Biomarker Matrix\nWilliam's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
      }
    },
    {
      "type": "Visit",
      "date": "2024.06.12",
      "summary": "6-month geriatric assessment.",
      "state": {
        "patientGoals": "Routine check, family notes mild forgetfulness.",
        "vitals": {
          "bp": "130/80",
          "hr": "70",
          "temp": "98.1°F",
          "spO2": "98%",
          "weight": "165 lbs",
          "height": "5'9\""
        },
        "oxidativeStressMarkers": [
          {
            "id": "1",
            "name": "8-OHdG",
            "value": "10 ng/mg creatinine"
          }
        ],
        "antioxidantSources": [
          {
            "id": "1",
            "name": "Alpha-Tocopherol",
            "value": "12.0 mg/L"
          }
        ],
        "medications": [
          {
            "id": "1",
            "name": "Donepezil",
            "value": "5mg Daily"
          },
          {
            "id": "2",
            "name": "Aspirin",
            "value": "81mg Daily"
          },
          {
            "id": "3",
            "name": "Furosemide",
            "value": "20mg Daily"
          }
        ],
        "issues": {
          "head": [
            {
              "id": "head",
              "noteId": "note_p003_head_hist2",
              "name": "Brain & Cognition",
              "painLevel": 0,
              "description": "Mild short-term memory deficits noted.",
              "symptoms": []
            }
          ]
        }
      }
    }
  ],
  "bookmarks": [],
  "scans": [
    {
      "id": "scan_004",
      "type": "CT Scan",
      "title": "Non-Contrast Head CT",
      "date": "2024.12.04",
      "bodyPartId": "head",
      "description": "Mild diffuse age-related volume loss. No acute intracranial hemorrhage or mass effect. Tiny focal areas of chronic microvascular ischemic disease.",
      "status": "Reviewed",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/CT_scan_of_the_brain.jpg/640px-CT_scan_of_the_brain.jpg"
    },
    {
      "id": "scan_005",
      "type": "X-Ray",
      "title": "Right Forearm/Wrist",
      "date": "2024.12.04",
      "bodyPartId": "r_arm",
      "description": "No acute displaced fracture or dislocation. Degenerative changes in radiocarpal joint.",
      "status": "Reviewed",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/X-Ray_of_Colles_Fracture.jpg/640px-X-Ray_of_Colles_Fracture.jpg"
    }
  ]
};

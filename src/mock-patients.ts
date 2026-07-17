import { IPatient } from './services/patient.types';

export const MOCK_PATIENTS: IPatient[] = [
  {
    "id": "p001",
    "name": "Robert Davis",
    "age": 58,
    "gender": "Male",
    "lastVisit": "2024.11.20",
    "preexistingConditions": [
      "Essential Hypertension",
      "Type 2 Diabetes Mellitus",
      "Obesity (BMI 42)",
      "Severe Obstructive Sleep Apnea",
      "Metabolic Syndrome"
    ],
    "patientGoals": "Discuss CPAP compliance issues and weight management strategies.",
    "vitals": {
      "bp": "152/95",
      "hr": "88",
      "temp": "98.4°F",
      "spO2": "94%",
      "weight": "295 lbs",
      "height": "5'10\""
    },
    "oxidativeStressMarkers": [
      {
        "id": "1",
        "name": "Malondialdehyde (MDA)",
        "value": "3.8 μmol/L"
      },
      {
        "id": "2",
        "name": "F2-Isoprostanes",
        "value": "45 pg/mg creatinine"
      }
    ],
    "antioxidantSources": [
      {
        "id": "1",
        "name": "Glutathione (GSH)",
        "value": "1.2 μmol/g Hb"
      },
      {
        "id": "2",
        "name": "CoQ10",
        "value": "0.45 μg/mL"
      }
    ],
    "medications": [
      {
        "id": "1",
        "name": "Lisinopril",
        "value": "20mg Daily"
      },
      {
        "id": "2",
        "name": "Metformin",
        "value": "1000mg BID"
      },
      {
        "id": "3",
        "name": "Atorvastatin",
        "value": "40mg Daily"
      }
    ],
    "issues": {
      "chest": [
        {
          "id": "chest",
          "noteId": "note_p001_chest_1",
          "name": "Chest & Lungs",
          "painLevel": 1,
          "description": "Reports waking up gasping for air frequently. Daytime somnolence affecting work performance.",
          "symptoms": []
        }
      ],
      "head": [
        {
          "id": "head",
          "noteId": "note_p001_head_1",
          "name": "Head & Neck",
          "painLevel": 2,
          "description": "Morning headaches nearly every day, likely secondary to hypoxemia and OSA.",
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
          "Summary Overview": "### Clinical Assessment\nRobert Davis presents with a complex clinical picture primarily characterized by Chest & Lungs, Head & Neck. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Robert's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Robert should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nRobert's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2024.10.10",
        "summary": "Initial consultation for sleep study follow-up.",
        "state": {
          "patientGoals": "Review sleep study results.",
          "vitals": {
            "bp": "148/92",
            "hr": "85",
            "temp": "98.6°F",
            "spO2": "96%",
            "weight": "298 lbs",
            "height": "5'10\""
          },
          "oxidativeStressMarkers": [
            {
              "id": "1",
              "name": "Malondialdehyde (MDA)",
              "value": "3.6 μmol/L"
            }
          ],
          "antioxidantSources": [
            {
              "id": "1",
              "name": "Glutathione (GSH)",
              "value": "1.4 μmol/g Hb"
            }
          ],
          "medications": [
            {
              "id": "1",
              "name": "Lisinopril",
              "value": "20mg Daily"
            },
            {
              "id": "2",
              "name": "Metformin",
              "value": "1000mg BID"
            },
            {
              "id": "3",
              "name": "Atorvastatin",
              "value": "40mg Daily"
            }
          ],
          "issues": {}
        }
      }
    ],
    "bookmarks": [],
    "scans": [
      {
        "id": "scan_003",
        "type": "X-Ray",
        "title": "PA and Lateral Chest",
        "date": "2024.10.12",
        "bodyPartId": "chest",
        "description": "Bilateral hyperinflation consistent with COPD. No focal consolidation, pneumothorax or pleural effusion. Borderline cardiomegaly.",
        "status": "Reviewed",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chest_xray_mac.jpg/640px-Chest_xray_mac.jpg"
      }
    ],
    "dynamicNutrients": [],
    "clinicalNotes": [],
    "checklist": []
  },
  {
    "id": "p002",
    "name": "Sarah Jenkins",
    "age": 42,
    "gender": "Female",
    "lastVisit": "2024.12.01",
    "preexistingConditions": [
      "Asthma",
      "Anxiety Disorder",
      "Chronic Lower Back Pain",
      "Opioid Use Disorder (in remission)",
      "Depression"
    ],
    "patientGoals": "Seeking alternative pain management options to avoid opioid relapse.",
    "vitals": {
      "bp": "118/72",
      "hr": "76",
      "temp": "98.2°F",
      "spO2": "99%",
      "weight": "145 lbs",
      "height": "5'5\""
    },
    "biometricHistory": [
      {
        "timestamp": "2024-10-15T08:00:00Z",
        "type": "hr",
        "value": "78"
      },
      {
        "timestamp": "2024-11-01T08:00:00Z",
        "type": "hr",
        "value": "77"
      },
      {
        "timestamp": "2024-12-01T08:00:00Z",
        "type": "hr",
        "value": "76"
      },
      {
        "timestamp": "2024-10-15T08:00:00Z",
        "type": "spO2",
        "value": "98"
      },
      {
        "timestamp": "2024-11-01T08:00:00Z",
        "type": "spO2",
        "value": "98"
      },
      {
        "timestamp": "2024-12-01T08:00:00Z",
        "type": "spO2",
        "value": "99"
      },
      {
        "timestamp": "2024-10-15T08:00:00Z",
        "type": "bp",
        "value": "120/75"
      },
      {
        "timestamp": "2024-11-01T08:00:00Z",
        "type": "bp",
        "value": "119/73"
      },
      {
        "timestamp": "2024-12-01T08:00:00Z",
        "type": "bp",
        "value": "118/72"
      }
    ],
    "oxidativeStressMarkers": [],
    "antioxidantSources": [
      {
        "id": "1",
        "name": "Vitamin C",
        "value": "1.2 mg/dL"
      }
    ],
    "medications": [
      {
        "id": "1",
        "name": "Albuterol Inhaler",
        "value": "2 puffs PRN"
      },
      {
        "id": "2",
        "name": "Sertraline",
        "value": "50mg Daily"
      },
      {
        "id": "3",
        "name": "Gabapentin",
        "value": "300mg TID"
      },
      {
        "id": "4",
        "name": "Ibuprofen",
        "value": "600mg PRN MSK Pain"
      }
    ],
    "issues": {
      "mid_back": [
        {
          "id": "mid_back",
          "noteId": "note_p002_back_1",
          "name": "Lower Back",
          "painLevel": 7,
          "description": "Constant aching pain in L4-L5 region radiating to the left glute. Worsens with prolonged standing.",
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
          "Summary Overview": "### Clinical Assessment\nSarah Jenkins presents with a complex clinical picture primarily characterized by Lower Back. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Sarah's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Sarah should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nSarah's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2024.10.15",
        "summary": "Discussion of physical therapy and cognitive behavioral therapy for pain.",
        "state": {
          "patientGoals": "Need help managing flare-ups without medication.",
          "vitals": {
            "bp": "120/75",
            "hr": "74",
            "temp": "98.5°F",
            "spO2": "99%",
            "weight": "148 lbs",
            "height": "5'5\""
          },
          "oxidativeStressMarkers": [],
          "antioxidantSources": [],
          "medications": [
            {
              "id": "1",
              "name": "Albuterol Inhaler",
              "value": "2 puffs PRN"
            },
            {
              "id": "2",
              "name": "Sertraline",
              "value": "50mg Daily"
            },
            {
              "id": "3",
              "name": "Gabapentin",
              "value": "300mg TID"
            }
          ],
          "issues": {
            "mid_back": [
              {
                "id": "mid_back",
                "noteId": "note_p002_back_hist1",
                "name": "Lower Back",
                "painLevel": 6,
                "description": "Pain has been increasing recently due to work stress.",
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
        "id": "scan_001",
        "type": "MRI",
        "title": "Lumbar Spine MRI",
        "date": "2024.11.15",
        "bodyPartId": "lower_back",
        "description": "L4-L5 disc desiccation and mild paracentral disc protrusion without significant canal stenosis. Mild bilateral neural foraminal narrowing.",
        "status": "Reviewed",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MRI_of_the_Lumbar_Spine_%28Sagittal_View%29.jpg/640px-MRI_of_the_Lumbar_Spine_%28Sagittal_View%29.jpg"
      },
      {
        "id": "scan_002",
        "type": "X-Ray",
        "title": "Lumbar Spine AP/Lateral X-Ray",
        "date": "2024.11.02",
        "bodyPartId": "lower_back",
        "description": "Normal alignment. No fracture or acute bony abnormality. Mild degenerative disc disease at L4-L5.",
        "status": "Reviewed",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/X-ray_of_the_lumbar_spine_%28lateral_view%29.jpg/640px-X-ray_of_the_lumbar_spine_%28lateral_view%29.jpg"
      }
    ]
  },
  {
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
  },
  {
    "id": "p004",
    "name": "Global Sentinel",
    "age": 72,
    "gender": "Other",
    "lastVisit": "2026.03.12",
    "preexistingConditions": [],
    "patientGoals": "Evaluate global mortality risks and complex multimorbidity presentation.",
    "vitals": {
      "bp": "155/95",
      "hr": "88",
      "temp": "98.6°F",
      "spO2": "92%",
      "weight": "185 lbs",
      "height": "5'8\""
    },
    "issues": {
      "full_body": [
        {
          "id": "full_body",
          "noteId": "note_p004_full_1",
          "name": "Systemic Health",
          "painLevel": 5,
          "description": "Patient exhibits clinical signs or risks associated with the top 10 global causes of death based on WHO 2021 estimates.",
          "symptoms": [
            {
              "name": "Ischaemic heart disease",
              "type": "Cardiovascular",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "COVID-19",
              "type": "Respiratory/Infectious",
              "verified": true,
              "timeline": "Acute/Chronic"
            },
            {
              "name": "Stroke",
              "type": "Neurological/Cardiovascular",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Chronic obstructive pulmonary disease (COPD)",
              "type": "Respiratory",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Lower respiratory infections",
              "type": "Respiratory/Infectious",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Trachea, bronchus, and lung cancers",
              "type": "Oncology",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Alzheimer's disease and other dementias",
              "type": "Neurological",
              "verified": true,
              "timeline": "Progressive"
            },
            {
              "name": "Diabetes mellitus",
              "type": "Metabolic",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Kidney diseases",
              "type": "Renal",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Hypertensive heart disease",
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
        "summary": "Comprehensive Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nGlobal Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Global's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Global should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nGlobal's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.12",
        "summary": "Comprehensive review of multimorbidity indicators.",
        "state": {
          "patientGoals": "Evaluate global mortality risks.",
          "vitals": {
            "bp": "155/95",
            "hr": "88",
            "temp": "98.6°F",
            "spO2": "92%",
            "weight": "185 lbs",
            "height": "5'8\""
          },
          "issues": {}
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p005",
    "name": "CDC Sentinel",
    "age": 78,
    "gender": "Other",
    "lastVisit": "2026.03.12",
    "preexistingConditions": [],
    "patientGoals": "Evaluate US mortality risks and complex multimorbidity presentation.",
    "vitals": {
      "bp": "148/92",
      "hr": "82",
      "temp": "98.4°F",
      "spO2": "94%",
      "weight": "195 lbs",
      "height": "5'9\""
    },
    "issues": {
      "full_body": [
        {
          "id": "full_body",
          "noteId": "note_p005_full_1",
          "name": "Systemic Health",
          "painLevel": 6,
          "description": "Patient exhibits clinical signs or risks associated with the top 10 leading causes of death in the US based on CDC 2023 provisional data.",
          "symptoms": [
            {
              "name": "Heart disease",
              "type": "Cardiovascular",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Cancer",
              "type": "Oncology",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Unintentional injuries",
              "type": "Trauma",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Stroke (cerebrovascular diseases)",
              "type": "Neurological/Cardiovascular",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Chronic lower respiratory diseases",
              "type": "Respiratory",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Alzheimer's disease",
              "type": "Neurological",
              "verified": true,
              "timeline": "Progressive"
            },
            {
              "name": "Diabetes mellitus",
              "type": "Metabolic",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Nephritis, nephrotic syndrome, and nephrosis",
              "type": "Renal",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Chronic liver disease and cirrhosis",
              "type": "Hepatic",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "COVID-19",
              "type": "Respiratory/Infectious",
              "verified": true,
              "timeline": "Acute/Chronic"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "AnalysisRun",
        "date": "2026.06.25",
        "summary": "Comprehensive Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nCDC Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of CDC's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. CDC should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nCDC's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.12",
        "summary": "Comprehensive review of leading national mortality indicators.",
        "state": {
          "patientGoals": "Evaluate national mortality risks.",
          "vitals": {
            "bp": "148/92",
            "hr": "82",
            "temp": "98.4°F",
            "spO2": "94%",
            "weight": "195 lbs",
            "height": "5'9\""
          },
          "issues": {}
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p006",
    "name": "Pediatric Sentinel",
    "age": 4,
    "gender": "Male",
    "lastVisit": "2026.03.12",
    "preexistingConditions": [],
    "patientGoals": "Evaluate global pediatric mortality risks (Under 5).",
    "vitals": {
      "bp": "95/60",
      "hr": "110",
      "temp": "99.1°F",
      "spO2": "96%",
      "weight": "35 lbs",
      "height": "3'4\""
    },
    "issues": {
      "full_body": [
        {
          "id": "full_body",
          "noteId": "note_p006_full_1",
          "name": "Systemic Health",
          "painLevel": 4,
          "description": "Patient exhibits clinical signs or risks associated with the top causes of global under-5 child mortality.",
          "symptoms": [
            {
              "name": "Preterm birth complications",
              "type": "Neonatal",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Lower respiratory infections (Pneumonia)",
              "type": "Respiratory/Infectious",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Intrapartum-related events (Birth Asphyxia/Trauma)",
              "type": "Neonatal/Trauma",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Diarrhoeal diseases",
              "type": "Gastrointestinal/Infectious",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Congenital anomalies",
              "type": "Congenital",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Malaria",
              "type": "Infectious",
              "verified": true,
              "timeline": "Acute"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "AnalysisRun",
        "date": "2026.06.25",
        "summary": "Comprehensive Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nPediatric Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Pediatric's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Pediatric should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nPediatric's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.12",
        "summary": "Comprehensive review of leading pediatric mortality indicators.",
        "state": {
          "patientGoals": "Evaluate pediatric mortality risks.",
          "vitals": {
            "bp": "95/60",
            "hr": "110",
            "temp": "99.1°F",
            "spO2": "96%",
            "weight": "35 lbs",
            "height": "3'4\""
          },
          "issues": {}
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p007",
    "name": "Maternal Sentinel",
    "age": 28,
    "gender": "Female",
    "lastVisit": "2026.03.12",
    "preexistingConditions": [],
    "patientGoals": "Evaluate global maternal mortality risks.",
    "vitals": {
      "bp": "135/85",
      "hr": "90",
      "temp": "98.8°F",
      "spO2": "98%",
      "weight": "165 lbs",
      "height": "5'6\""
    },
    "issues": {
      "full_body": [
        {
          "id": "full_body",
          "noteId": "note_p007_full_1",
          "name": "Systemic Health",
          "painLevel": 7,
          "description": "Patient exhibits clinical signs or risks associated with the top causes of maternal mortality.",
          "symptoms": [
            {
              "name": "Severe bleeding (Hemorrhage)",
              "type": "Obstetric/Cardiovascular",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Infections (Sepsis)",
              "type": "Infectious",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Gestational Hypertension (Pre-eclampsia/Eclampsia)",
              "type": "Cardiovascular/Obstetric",
              "verified": true,
              "timeline": "Acute/Chronic"
            },
            {
              "name": "Complications from delivery",
              "type": "Obstetric",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Unsafe abortion complications",
              "type": "Obstetric/Trauma",
              "verified": true,
              "timeline": "Acute"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "AnalysisRun",
        "date": "2026.06.25",
        "summary": "Comprehensive Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nMaternal Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Maternal's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Maternal should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nMaternal's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.12",
        "summary": "Comprehensive review of leading maternal mortality indicators.",
        "state": {
          "patientGoals": "Evaluate maternal mortality risks.",
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
    "bookmarks": []
  },
  {
    "id": "p008",
    "name": "Linus P (Orthomolecular Profile)",
    "age": 93,
    "gender": "Male",
    "lastVisit": "2024.12.10",
    "preexistingConditions": [
      "Prostate Cancer",
      "Coronary Artery Disease",
      "Macular Degeneration"
    ],
    "patientGoals": "Evaluate high-dose ascorbic acid therapy and Lp(a) management.",
    "vitals": {
      "bp": "125/78",
      "hr": "68",
      "temp": "98.2°F",
      "spO2": "98%",
      "weight": "165 lbs",
      "height": "5'10\"",
      "vitC": "10000",
      "vitD3": "85",
      "magnesium": "6.5",
      "zinc": "120",
      "b12": "1200"
    },
    "oxidativeStressMarkers": [
      {
        "id": "1",
        "name": "Oxidative Stress",
        "value": "2.5"
      }
    ],
    "antioxidantSources": [
      {
        "id": "1",
        "name": "Antioxidant Status",
        "value": "9.2"
      }
    ],
    "medications": [],
    "issues": {
      "chest": [
        {
          "id": "chest",
          "noteId": "note_p008_chest_1",
          "name": "Cardiovascular",
          "painLevel": 1,
          "description": "Mild angina on heavy exertion. Managing with Pauling therapy.",
          "symptoms": []
        }
      ],
      "pelvis": [
        {
          "id": "pelvis",
          "noteId": "note_p008_pelvis_1",
          "name": "Prostate",
          "painLevel": 2,
          "description": "PSA stable at 4.2. Monitoring oxidative stress markers.",
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
          "Summary Overview": "### Clinical Assessment\nLinus P (Orthomolecular Profile) presents with a complex clinical picture primarily characterized by Cardiovascular, Prostate. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          "Nutrition": "### Biochemical Assessment\nAnalysis of Linus's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Linus should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nLinus's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM."
        }
      },
      {
        "type": "ChartArchived",
        "date": "2024.10.10",
        "summary": "Initiated Pauling Therapy (Vit C + Lysine + Proline).",
        "state": {
          "patientGoals": "Reduce lipoprotein(a) levels and arterial plaque.",
          "vitals": {
            "bp": "135/85",
            "hr": "72",
            "temp": "98.4°F",
            "spO2": "97%",
            "weight": "168 lbs",
            "height": "5'10\"",
            "vitC": "3000",
            "vitD3": "45",
            "magnesium": "4.2",
            "zinc": "85",
            "b12": "600"
          },
          "oxidativeStressMarkers": [
            {
              "id": "1",
              "name": "Oxidative Stress",
              "value": "6.8"
            }
          ],
          "antioxidantSources": [
            {
              "id": "1",
              "name": "Antioxidant Status",
              "value": "4.5"
            }
          ],
          "medications": [],
          "dynamicNutrients": [
            {
              "id": "1",
              "name": "L-Lysine",
              "value": "3000 mg"
            },
            {
              "id": "2",
              "name": "L-Proline",
              "value": "1500 mg"
            },
            {
              "id": "3",
              "name": "Lipoprotein(a)",
              "value": "150 mg/dL"
            }
          ],
          "issues": {}
        }
      },
      {
        "type": "ChartArchived",
        "date": "2024.11.10",
        "summary": "One month follow-up on Pauling Therapy.",
        "state": {
          "patientGoals": "Titrating dose to bowel tolerance.",
          "vitals": {
            "bp": "130/80",
            "hr": "70",
            "temp": "98.3°F",
            "spO2": "98%",
            "weight": "166 lbs",
            "height": "5'10\"",
            "vitC": "6000",
            "vitD3": "65",
            "magnesium": "5.5",
            "zinc": "105",
            "b12": "900"
          },
          "oxidativeStressMarkers": [
            {
              "id": "1",
              "name": "Oxidative Stress",
              "value": "4.2"
            }
          ],
          "antioxidantSources": [
            {
              "id": "1",
              "name": "Antioxidant Status",
              "value": "7.1"
            }
          ],
          "medications": [],
          "dynamicNutrients": [
            {
              "id": "1",
              "name": "L-Lysine",
              "value": "5000 mg"
            },
            {
              "id": "2",
              "name": "L-Proline",
              "value": "2500 mg"
            },
            {
              "id": "3",
              "name": "Lipoprotein(a)",
              "value": "95 mg/dL"
            }
          ],
          "issues": {}
        }
      },
      {
        "type": "Visit",
        "date": "2024.12.10",
        "summary": "Two month follow-up. Symptoms improving.",
        "state": {
          "patientGoals": "Evaluate high-dose ascorbic acid therapy and Lp(a) management.",
          "vitals": {
            "bp": "125/78",
            "hr": "68",
            "temp": "98.2°F",
            "spO2": "98%",
            "weight": "165 lbs",
            "height": "5'10\"",
            "vitC": "10000",
            "vitD3": "85",
            "magnesium": "6.5",
            "zinc": "120",
            "b12": "1200"
          },
          "oxidativeStressMarkers": [
            {
              "id": "1",
              "name": "Oxidative Stress",
              "value": "2.5"
            }
          ],
          "antioxidantSources": [
            {
              "id": "1",
              "name": "Antioxidant Status",
              "value": "9.2"
            }
          ],
          "medications": [],
          "dynamicNutrients": [
            {
              "id": "1",
              "name": "L-Lysine",
              "value": "6000 mg"
            },
            {
              "id": "2",
              "name": "L-Proline",
              "value": "3000 mg"
            },
            {
              "id": "3",
              "name": "Lipoprotein(a)",
              "value": "30 mg/dL"
            },
            {
              "id": "4",
              "name": "CoQ10",
              "value": "400 mg"
            }
          ],
          "issues": {}
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p_phil_gear",
    "name": "Phil Gear",
    "age": 42,
    "gender": "Male",
    "lastVisit": "2026.06.08",
    "preexistingConditions": [
      "Mild Hypertension",
      "Mild Sleep Apnea (CPAP-managed)",
      "Chronic Tension Headache",
      "Developer & Founder (High Cognitive Load)"
    ],
    "patientGoals": "Optimize metabolic health, resolve evening tension headaches, reduce sleep latency to under 20 minutes, and synchronize biometrics from Google Health Connect.",
    "vitals": {
      "bp": "122/82",
      "hr": "64",
      "temp": "98.4°F",
      "spO2": "98%",
      "weight": "178 lbs",
      "height": "5'10\"",
      "vitD3": "28 ng/mL (Sub-optimal)",
      "magnesium": "1.7 mg/dL (Low-normal)",
      "b12": "412 pg/mL (Adequate)",
      "zinc": "82 mcg/dL (Optimal)"
    },
    "oxidativeStressMarkers": [
      {
        "id": "1",
        "name": "Homocysteine",
        "value": "10.2 μmol/L (Borderline)"
      },
      {
        "id": "2",
        "name": "hsCRP",
        "value": "1.4 mg/L (Low-grade)"
      }
    ],
    "antioxidantSources": [
      {
        "id": "1",
        "name": "Glutathione (GSH)",
        "value": "1.8 μmol/g Hb (Adequate)"
      },
      {
        "id": "2",
        "name": "CoQ10",
        "value": "0.62 μg/mL (Adequate)"
      }
    ],
    "medications": [
      {
        "id": "1",
        "name": "Lisinopril",
        "value": "10mg Daily"
      },
      {
        "id": "2",
        "name": "Melatonin",
        "value": "0.5mg PRN sleep onset"
      }
    ],
    "biometricHistory": [
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "hr",
        "value": "72"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "hr",
        "value": "70"
      },
      {
        "timestamp": "2026-02-20T08:00:00Z",
        "type": "hr",
        "value": "68"
      },
      {
        "timestamp": "2026-03-15T08:00:00Z",
        "type": "hr",
        "value": "66"
      },
      {
        "timestamp": "2026-04-10T08:00:00Z",
        "type": "hr",
        "value": "65"
      },
      {
        "timestamp": "2026-06-08T08:00:00Z",
        "type": "hr",
        "value": "64"
      },
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "spO2",
        "value": "96"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2026-02-20T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2026-03-15T08:00:00Z",
        "type": "spO2",
        "value": "98"
      },
      {
        "timestamp": "2026-04-10T08:00:00Z",
        "type": "spO2",
        "value": "98"
      },
      {
        "timestamp": "2026-06-08T08:00:00Z",
        "type": "spO2",
        "value": "98"
      },
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "bp",
        "value": "130/88"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "bp",
        "value": "128/85"
      },
      {
        "timestamp": "2026-02-20T08:00:00Z",
        "type": "bp",
        "value": "126/84"
      },
      {
        "timestamp": "2026-03-15T08:00:00Z",
        "type": "bp",
        "value": "124/83"
      },
      {
        "timestamp": "2026-04-10T08:00:00Z",
        "type": "bp",
        "value": "123/82"
      },
      {
        "timestamp": "2026-06-08T08:00:00Z",
        "type": "bp",
        "value": "122/82"
      }
    ],
    "issues": {
      "head": [
        {
          "id": "head",
          "noteId": "note_phil_head_1",
          "name": "Head & Neck",
          "painLevel": 3,
          "description": "Mild-to-moderate tension headaches occurring 3-4x per week in the evening after extended screen time. Associated with suboccipital tightness and eye strain. Worsens with caffeine excess and poor sleep.",
          "symptoms": [
            {
              "name": "Tension headache",
              "type": "Neurological",
              "verified": true,
              "timeline": "Recurrent"
            },
            {
              "name": "Sleep onset insomnia",
              "type": "Neurological/Sleep",
              "verified": true,
              "timeline": "Chronic"
            }
          ]
        }
      ],
      "upper_back": [
        {
          "id": "upper_back",
          "noteId": "note_phil_back_1",
          "name": "Upper Back & Shoulders",
          "painLevel": 2,
          "description": "Mild trapezius tightness bilaterally. Attributable to prolonged seated developer posture and laptop use. Improves with movement.",
          "symptoms": []
        }
      ]
    },
    "history": [
      {
        "type": "AnalysisRun",
        "date": "2026.06.08",
        "summary": "Comprehensive Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nPhil Gear presents as a high-cognitive-load developer and founder managing mild hypertension, CPAP-treated sleep apnea, and recurrent tension headaches. The primary drivers are screen-time-induced circadian disruption, suboptimal intracellular magnesium, borderline Vitamin D3, and low-grade sympathetic nervous system dominance from sustained work demands.\n\n### Priority List\n*   **Circadian Realignment**: Blue-light hygiene and structured morning anchor protocol.\n*   **Magnesium Repletion**: Targeting NMDA receptor stabilization and tension headache reduction.\n*   **HPA Axis Support**: Adaptogenic protocol to reduce cortisol load from founder stress.\n*   **Biometric Tracking**: Google Health Connect integration for daily HRV, HR, and SpO2 trend analysis.\n\n### Plan of Care\n*   Initiate magnesium glycinate and Vitamin D3/K2 protocol.\n*   Implement strict circadian anchor routine (sleep onset 10:30 PM target).\n*   Introduce zone 2 cardio 3x/week to support HRV recovery.\n*   Follow-up biometric review in 4 weeks.\n\n### Goals\n*   **Short-term (4 weeks)**: Reduce headache frequency by 50%. Sleep latency < 20 minutes.\n*   **Long-term (3 months)**: BP < 120/80, HRV improvement > 15%, and stable circadian rhythm.",
          "Functional Protocols": "### Immediate Actions (72 hours)\n*   Install blue-light blocking glasses or activate Night Shift/f.lux after 7:00 PM.\n*   Move all high-cognitive-load work to before 4:00 PM; reserve evenings for low-stimulation activities.\n\n### Circadian Anchor Protocol\n| Anchor Point | Activity | Rationale |\n| :--- | :--- | :--- |\n| 6:30 AM | 10-min outdoor sunlight + cold splash | Cortisol pulse suppression + circadian set |\n| 12:00 PM | Walk (20 min) | Zone 2 + insulin sensitivity reset |\n| 7:00 PM | Blue-light off; dim lighting | Melatonin onset preservation |\n| 10:30 PM | Target sleep onset | 8h sleep window for apnea management |\n\n### Foundational Protocol\n*   Zone 2 cardio (HR 120-140): 3x per week, 30-45 minutes (cycle or treadmill)\n*   Daily 4-7-8 breathing (evening): 4 rounds before sleep to activate parasympathetic tone\n*   Posture reset: Chin tucks + thoracic extension x 10 reps every 90 minutes at desk",
          "Nutrition": "### Biochemical Assessment\nPhil's dietary profile shows adequate macronutrient intake but micronutrient gaps in magnesium (chronic dietary shortfall in Western male developers) and Vitamin D3 (insufficient outdoor exposure). Borderline homocysteine suggests mild methylation strain from high cognitive demand.\n\n### Nutrition Targets\n*   **Magnesium Repletion**: Top dietary priority — target 420mg elemental/day.\n*   **Vitamin D3 Optimization**: Combined dietary + supplement target 50 ng/mL serum level.\n*   **Anti-inflammatory Pattern**: Reduce arachidonic acid load from processed snacks.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Magnesium Glycinate | 400mg | Before bed | NMDA / Muscle tension / Sleep |\n| Vitamin D3 + K2 | 5000 IU / 100mcg | With breakfast | Immune / Bone / Mood |\n| Omega-3 EPA/DHA | 2000mg | With meals | hsCRP reduction / Cardiovascular |\n| L-Theanine | 200mg | Pre-work + evening | Focus / Cortisol smoothing |\n\n### Dietary Adjustments\n- **Add**: Dark leafy greens (400g/day), pumpkin seeds (30g/day), avocado (daily)\n- **Reduce**: Caffeine after 1:00 PM; switch to L-theanine + green tea after noon\n- **Hydration**: 2.5L water/day minimum; add electrolytes (sodium, potassium) to morning water",
          "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Begin magnesium glycinate + Vitamin D3/K2 protocol immediately.\n2.  Set up Google Health Connect dashboard for daily HR, HRV, and SpO2 monitoring.\n3.  Activate blue-light blocking protocol.\n4.  4-week check-in: assess headache frequency, sleep latency, and resting HR trend.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Resting HR | < 62 bpm | Daily (wearable) | > 75 bpm for 3+ days |\n| Sleep Latency | < 20 min | Daily | > 45 min on 3+ consecutive nights |\n| Headache Frequency | < 1x/week | Weekly log | > 4x/week or severity > 6/10 |\n| BP | < 120/80 | Bi-weekly | > 135/85 on 2 consecutive readings |\n| Serum Vitamin D3 | 50-70 ng/mL | 12-week lab | < 30 ng/mL |\n\n### Long-term Trajectory (6+ months)\nWith consistent execution, Phil should see normalization of BP without Lisinopril dose increase, significant HRV improvement via wearable tracking, and elimination of recurrent tension headaches. Quarterly biometric reviews via Google Health Connect will guide protocol adjustments.",
          "Patient Education": "### Understanding Your Health Picture\nYour body is dealing with the classic high-performance developer pattern: sustained mental output without adequate physical recovery, low dietary magnesium, disrupted circadian rhythm from screens, and compounding sympathetic nervous system activation from founder responsibilities.\n\n### What Was Found\n*   **Magnesium Gap**: This single deficiency explains your tension headaches, mild sleep issues, and suboptimal BP control.\n*   **Circadian Disruption**: Screen-induced blue light is delaying your melatonin onset by 1-2 hours, fragmenting your sleep architecture.\n*   **Low-Grade Inflammation**: Your hsCRP of 1.4 mg/L is manageable but warrants dietary attention.\n\n### Your Action Plan\n*   **Tonight**: Take magnesium glycinate before bed. Install f.lux or Night Shift. This will produce measurable results within 72 hours.\n*   **This Week**: Walk for 20 minutes at lunch daily. No caffeine after 1:00 PM.\n*   **Month 1**: Track sleep + HRV daily. Report any headaches in the Pocket Gull app.\n\n### Important Notes\n> 💡 Your Lisinopril is doing its job — do not stop it. These protocols are designed to work alongside it, and over time may reduce the dose required. Always consult your prescribing physician before any medication changes.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nPhil's orthomolecular profile is consistent with a high-cognitive-load male in his early 40s: suboptimal intracellular magnesium (the most common deficiency in Western male knowledge workers), insufficient Vitamin D3, and borderline homocysteine signaling mild methylation cycle strain. CoQ10 and glutathione are adequate.\n\n```json\n[\n  { \"name\": \"Magnesium\", \"level\": \"Sub-optimal\", \"pathway\": \"NMDA / ATP Synthesis / Sleep\" },\n  { \"name\": \"Vitamin D3\", \"level\": \"Sub-optimal\", \"pathway\": \"Immune / Mood / Bone\" },\n  { \"name\": \"Vitamin B12\", \"level\": \"Optimal\", \"pathway\": \"Methylation\" },\n  { \"name\": \"Zinc\", \"level\": \"Optimal\", \"pathway\": \"Immune / Hormones\" },\n  { \"name\": \"Homocysteine\", \"level\": \"Borderline\", \"pathway\": \"Cardiovascular / Methylation\" },\n  { \"name\": \"CoQ10\", \"level\": \"Adequate\", \"pathway\": \"Mitochondrial / Cardiac\" }\n]\n```\n\n### Detected Deficiencies\n- **Magnesium (Sub-optimal)**: NMDA receptor hyperexcitability from low Mg directly causes tension-type headaches and sleep-onset difficulty. Priority one intervention.\n- **Vitamin D3 (Sub-optimal at 28 ng/mL)**: Target is 50-70 ng/mL. Low D3 contributes to mood instability, impaired immune surveillance, and suboptimal serotonin synthesis.\n- **Homocysteine (Borderline at 10.2 μmol/L)**: Suggests mild one-carbon metabolism strain. May worsen if cognitive demand continues without B-vitamin support.\n\n### Orthomolecular Protocol\n| Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway |\n|---|---|---|---|\n| Magnesium Glycinate | 400mg elemental | Oral, nightly with food | NMDA antagonism / Tension headache / Sleep |\n| Vitamin D3 + K2 | 5000 IU D3 / 100mcg MK-7 | Oral with fat-containing meal | Serum D3 optimization / Bone / Mood |\n| L-Methylfolate (5-MTHF) | 400mcg | Oral with B12 | Homocysteine reduction / Methylation |\n| L-Theanine | 200mg | Oral (AM + PM) | Alpha-wave induction / Cortisol smoothing |\n| Omega-3 EPA/DHA | 2000mg | Oral with meals | hsCRP reduction / Cardiovascular |\n\n### Cautions & Interactions\n- **Magnesium + Lisinopril**: Generally well-tolerated; high-dose Mg may slightly lower BP — monitor for dizziness. Adjust Lisinopril if BP drops below 110/70.\n- **L-Methylfolate + SSRI (if initiated)**: Monitor for serotonin syndrome if antidepressant therapy is ever added; methylfolate enhances serotonergic activity.\n- **Vitamin D3 Toxicity**: Recheck 25(OH)D at 12 weeks; target 50-70 ng/mL. Above 100 ng/mL carries hypercalcemia risk."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.15",
        "summary": "Initial biometric review: HRV trending low, sleep latency complaints, and headache pattern established.",
        "state": {
          "patientGoals": "Reduce headache frequency and improve sleep quality.",
          "vitals": {
            "bp": "126/84",
            "hr": "68",
            "temp": "98.5°F",
            "spO2": "97%",
            "weight": "180 lbs",
            "height": "5'10\""
          },
          "oxidativeStressMarkers": [],
          "antioxidantSources": [],
          "medications": [
            {
              "id": "1",
              "name": "Lisinopril",
              "value": "10mg Daily"
            }
          ],
          "issues": {
            "head": [
              {
                "id": "head",
                "noteId": "note_phil_head_hist1",
                "name": "Head & Neck",
                "painLevel": 4,
                "description": "Frequent evening headaches, 4-5x per week. Attributable to screen time.",
                "symptoms": []
              }
            ]
          }
        }
      }
    ],
    "bookmarks": [],
    "scans": [],
    "dietaryProtocol": "",
    "dynamicNutrients": [],
    "clinicalNotes": [],
    "checklist": [],
    "shoppingList": [],
    "activePhilosophy": "western",
    "ayurvedicStatus": {}
  },
  {
    "id": "p_mara_santos",
    "name": "Mara Santos",
    "age": 34,
    "gender": "Female",
    "lastVisit": "2026.06.20",
    "preexistingConditions": [
      "Relapsing-Remitting Multiple Sclerosis (RRMS)",
      "History of Optic Neuritis (Left Eye, 2024)",
      "Chronic Fatigue",
      "Mild Depression (reactive)",
      "Vitamin D Deficiency"
    ],
    "patientGoals": "Extend relapse-free interval, manage fatigue without additional sedating medications, preserve cognitive function, and explore integrative approaches alongside DMT.",
    "vitals": {
      "bp": "108/68",
      "hr": "76",
      "temp": "98.1°F",
      "spO2": "97%",
      "weight": "138 lbs",
      "height": "5'6\"",
      "vitD3": "18 ng/mL (Deficient)",
      "magnesium": "1.6 mg/dL (Low)",
      "b12": "310 pg/mL (Low-normal)",
      "zinc": "68 mcg/dL (Low-normal)"
    },
    "oxidativeStressMarkers": [
      {
        "id": "1",
        "name": "hsCRP",
        "value": "3.2 mg/L (Elevated)"
      },
      {
        "id": "2",
        "name": "Homocysteine",
        "value": "14.1 μmol/L (Elevated)"
      },
      {
        "id": "3",
        "name": "Neurofilament Light Chain (NfL)",
        "value": "18.2 pg/mL (Elevated)"
      }
    ],
    "antioxidantSources": [
      {
        "id": "1",
        "name": "Glutathione (GSH)",
        "value": "1.1 μmol/g Hb (Low)"
      },
      {
        "id": "2",
        "name": "CoQ10",
        "value": "0.38 μg/mL (Low)"
      },
      {
        "id": "3",
        "name": "Alpha-Lipoic Acid",
        "value": "Not tested"
      }
    ],
    "medications": [
      {
        "id": "1",
        "name": "Ocrevus (Ocrelizumab)",
        "value": "600mg IV q6mo"
      },
      {
        "id": "2",
        "name": "Baclofen",
        "value": "10mg TID (spasticity)"
      },
      {
        "id": "3",
        "name": "Modafinil",
        "value": "100mg AM (fatigue)"
      },
      {
        "id": "4",
        "name": "Escitalopram",
        "value": "10mg Daily"
      }
    ],
    "biometricHistory": [
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "hr",
        "value": "82"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "hr",
        "value": "80"
      },
      {
        "timestamp": "2026-03-10T08:00:00Z",
        "type": "hr",
        "value": "78"
      },
      {
        "timestamp": "2026-04-20T08:00:00Z",
        "type": "hr",
        "value": "77"
      },
      {
        "timestamp": "2026-06-20T08:00:00Z",
        "type": "hr",
        "value": "76"
      },
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "spO2",
        "value": "96"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2026-03-10T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2026-04-20T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2026-06-20T08:00:00Z",
        "type": "spO2",
        "value": "97"
      },
      {
        "timestamp": "2025-12-01T08:00:00Z",
        "type": "bp",
        "value": "112/72"
      },
      {
        "timestamp": "2026-01-15T08:00:00Z",
        "type": "bp",
        "value": "110/70"
      },
      {
        "timestamp": "2026-03-10T08:00:00Z",
        "type": "bp",
        "value": "108/68"
      },
      {
        "timestamp": "2026-04-20T08:00:00Z",
        "type": "bp",
        "value": "110/70"
      },
      {
        "timestamp": "2026-06-20T08:00:00Z",
        "type": "bp",
        "value": "108/68"
      }
    ],
    "issues": {
      "head": [
        {
          "id": "head",
          "noteId": "note_mara_head_1",
          "name": "Head & Neurological",
          "painLevel": 4,
          "description": "Cognitive fog ('cog fog') worsening in afternoon. Word-finding difficulty during conversations. Mild persistent headache post-Ocrevus infusion (resolves in 48h). History of left optic neuritis with residual color desaturation.",
          "symptoms": [
            {
              "name": "Cognitive fog",
              "type": "Neurological",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Word-finding difficulty",
              "type": "Neurological",
              "verified": true,
              "timeline": "Progressive"
            },
            {
              "name": "Visual color desaturation (L)",
              "type": "Ophthalmological",
              "verified": true,
              "timeline": "Residual"
            }
          ]
        }
      ],
      "lower_back": [
        {
          "id": "lower_back",
          "noteId": "note_mara_back_1",
          "name": "Lumbar Spine & Lower Extremities",
          "painLevel": 5,
          "description": "Bilateral lower extremity spasticity, worse in the morning. Lhermitte's sign positive — electric shock sensation down spine on neck flexion. Gait instability increasing over last 3 months, using a cane intermittently.",
          "symptoms": [
            {
              "name": "Lower limb spasticity",
              "type": "Neurological/Motor",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Lhermitte's sign",
              "type": "Neurological",
              "verified": true,
              "timeline": "Active"
            },
            {
              "name": "Gait instability",
              "type": "Neurological/Motor",
              "verified": true,
              "timeline": "Progressive"
            }
          ]
        }
      ],
      "chest": [
        {
          "id": "chest",
          "noteId": "note_mara_chest_1",
          "name": "Chest & Respiratory",
          "painLevel": 2,
          "description": "Occasional MS hug — band-like tightness around the ribcage, typically triggered by heat or stress. Resolves with cooling and rest. No cardiac involvement suspected.",
          "symptoms": [
            {
              "name": "MS hug (dysesthesia)",
              "type": "Neurological/Sensory",
              "verified": true,
              "timeline": "Intermittent"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "AnalysisRun",
        "date": "2026.06.20",
        "summary": "Comprehensive MS Management Review",
        "report": {
          "Summary Overview": "### Clinical Assessment\nMara Santos is a 34-year-old female with relapsing-remitting multiple sclerosis (RRMS), diagnosed in 2023 following an episode of left optic neuritis. She is currently on Ocrevus (ocrelizumab) disease-modifying therapy with stable MRI lesion burden. Primary concerns are progressive fatigue, increasing cognitive fog, lower extremity spasticity with gait instability, and reactive depression.\n\n### Priority List\n*   **Neuroprotection**: Maximize myelin preservation and mitochondrial support in the CNS.\n*   **Fatigue Management**: Address the multifactorial MS fatigue (central, peripheral, sleep disruption, and deconditioning).\n*   **Spasticity Optimization**: Refine Baclofen timing and add non-pharmacological interventions.\n*   **Cognitive Rehabilitation**: Structured neuroplasticity exercises to counter cog fog.\n*   **Vitamin D Repletion**: Critical immunomodulatory gap — 18 ng/mL is dangerously low for RRMS.\n\n### Plan of Care\n*   Aggressive Vitamin D3 repletion to target 60-80 ng/mL (immune modulation + neuroprotection).\n*   CoQ10 + Alpha-Lipoic Acid protocol for mitochondrial rescue.\n*   Structured aquatic therapy program for spasticity + cardiovascular conditioning.\n*   Cognitive rehabilitation: daily dual-task training (walking + mental arithmetic).\n*   Reassess NfL and MRI at 6 months to track subclinical disease activity.\n\n### Goals\n*   **Short-term (4 weeks)**: Fatigue severity scale (FSS) reduction by 20%. Gait confidence improvement.\n*   **Long-term (6 months)**: Extend relapse-free interval to 18+ months. Serum Vitamin D3 > 60 ng/mL. Stabilize EDSS score.",
          "Functional Protocols": "### Immediate Actions (72 hours)\n*   Begin high-dose Vitamin D3 loading protocol: 10,000 IU/day for 8 weeks, then 5,000 IU maintenance.\n*   Add CoQ10 200mg BID with meals for mitochondrial support.\n*   Schedule aquatic therapy evaluation — pool temperature must be < 84°F (Uhthoff's precaution).\n\n### Movement & Rehabilitation Protocol\n| Intervention | Frequency | Duration | Precautions |\n| :--- | :--- | :--- | :--- |\n| Aquatic therapy (cool pool) | 3x/week | 30 min | Temp < 84°F; monitor for Uhthoff's |\n| Yoga Nidra (guided rest) | Daily | 20 min | For fatigue + parasympathetic reset |\n| Dual-task gait training | 5x/week | 15 min | Walking + cognitive tasks simultaneously |\n| Progressive resistance (seated) | 2x/week | 20 min | Target proximal muscle groups |\n\n### Spasticity Management\n*   Baclofen timing optimization: shift from TID to QID with lower individual doses (7.5mg x4) to smooth coverage.\n*   Add evening stretching routine (hamstrings, hip flexors, calves) — 15 min before bed.\n*   Consider trial of CBD oil (15mg sublingual) for breakthrough spasticity — discuss with neurologist.\n\n### Heat Sensitivity Protocol\n*   Cooling vest for any outdoor activity > 75°F.\n*   Pre-cooling before exercise (cold towel on neck, cold water).\n*   Avoid hot baths/showers; use lukewarm water only.",
          "Nutrition": "### Biochemical Assessment\nMara's nutritional profile reveals significant micronutrient depletion consistent with active autoimmune neuroinflammation. Vitamin D deficiency is the most critical gap — studies show RRMS patients with serum D3 > 50 ng/mL have 50-70% fewer relapses. Glutathione depletion signals oxidative stress in the CNS.\n\n### Nutrition Targets\n*   **Vitamin D3**: Aggressive repletion to 60-80 ng/mL — immunomodulatory priority.\n*   **Anti-inflammatory Diet**: Mediterranean-style with emphasis on omega-3 fatty acids.\n*   **Gut-Brain Axis**: Microbiome support for immune regulation.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | Immune modulation / Neuroprotection |\n| Omega-3 EPA/DHA | 3000mg (high EPA) | Oral with meals | Neuroinflammation / Myelin integrity |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Antioxidant |\n| Probiotics (multi-strain) | 50B CFU | Oral AM | Gut-brain axis / Immune regulation |\n\n### Dietary Pattern\n- **Adopt**: Modified Mediterranean / Wahls Protocol Level 1 — 9 cups vegetables daily (3 cups greens, 3 cups sulfur-rich, 3 cups deeply colored)\n- **Eliminate**: Gluten, dairy, refined sugar (30-day elimination trial to assess neuroinflammatory response)\n- **Emphasize**: Wild-caught fatty fish 3x/week, bone broth daily, fermented vegetables",
          "Monitoring & Follow-up": "### Immediate Monitoring (0-30 days)\n1.  Baseline Fatigue Severity Scale (FSS) and Modified Fatigue Impact Scale (MFIS) scores.\n2.  Recheck serum 25(OH)D at 8 weeks — target > 60 ng/mL.\n3.  Begin daily fatigue diary in Pocket Gull (rate 1-10, morning + afternoon).\n4.  Monitor Baclofen dose adjustment — watch for increased drowsiness.\n\n### Ongoing Surveillance\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Serum Vitamin D3 | 60-80 ng/mL | 8 weeks, then quarterly | < 30 ng/mL or > 100 ng/mL |\n| Neurofilament Light (NfL) | < 10 pg/mL | Every 6 months | Rising trend = subclinical activity |\n| EDSS Score | Stable or improving | Every 6 months | Any 0.5-point increase |\n| MRI Brain + C-spine | No new T2 lesions | Annual (or if symptoms) | New enhancing lesions |\n| Fatigue Severity Scale | < 4.0 | Monthly | > 5.5 sustained |\n| 25-ft Walk Test | Stable or improving | Every 3 months | > 20% decline |\n\n### Red Flags — Seek Immediate Care\n> ⚠️ New or worsening visual loss, sudden limb weakness, bladder retention, or severe vertigo lasting > 24 hours may indicate a relapse. Contact your MS neurologist immediately — do NOT wait for a scheduled visit.\n\n### Long-term Trajectory\nWith Ocrevus maintaining immune suppression, aggressive Vitamin D repletion, mitochondrial support, and structured rehabilitation, Mara's trajectory should show stabilization of EDSS and extension of the relapse-free interval. The elevated NfL (18.2 pg/mL) warrants close 6-month surveillance.",
          "Patient Education": "### Understanding Multiple Sclerosis\nYour immune system is mistakenly attacking the myelin coating on your nerve fibers — think of it like the insulation on electrical wires getting damaged. When the insulation is thin or missing, the signals slow down or short-circuit. That's why you experience the fatigue, the fog, the spasticity, and the tingling.\n\n### What Your Care Plan Addresses\n*   **The Fatigue**: MS fatigue isn't just 'being tired.' Your brain is working harder to route signals around damaged areas — like a GPS rerouting around road closures. The CoQ10 and mitochondrial support help your nerve cells produce more energy for this extra work.\n*   **The Spasticity**: Your muscles are getting garbled signals, causing them to tighten when they shouldn't. Baclofen helps quiet these signals, and aquatic therapy gives your body a low-gravity environment to move freely.\n*   **The Cognitive Fog**: Your brain can rewire itself (neuroplasticity). The dual-task exercises are training your brain to build new pathways around the damaged ones.\n*   **Vitamin D**: This is not just a vitamin for you — it's a critical immune system regulator. Keeping your levels high has been shown to significantly reduce MS relapses.\n\n### Your Action Plan\n*   **Today**: Start Vitamin D3 with your next meal. This is the single most impactful thing you can do right now.\n*   **This Week**: Begin the evening stretching routine for spasticity. Try the Yoga Nidra recording for fatigue.\n*   **This Month**: Schedule aquatic therapy evaluation. Start the fatigue diary in the app.\n\n### Important Safety Notes\n> 💡 Never skip your Ocrevus infusions — they are the foundation protecting your brain from new attacks. Everything else we're doing is designed to work alongside your DMT, not replace it.\n> \n> 🌡️ Heat is your enemy. Always have a cooling strategy before exercise or hot days. Even a warm shower can temporarily worsen your symptoms (Uhthoff's phenomenon) — this is not a relapse, it's temporary.",
          "Precision Nutrients": "### Biochemical & Biomarker Matrix\nMara's orthomolecular profile is characteristic of active CNS autoimmune disease: severe Vitamin D deficiency driving immune dysregulation, depleted glutathione indicating oxidative stress on oligodendrocytes, low CoQ10 impairing mitochondrial respiration in demyelinated axons, and elevated homocysteine suggesting methylation pathway strain.\n\n```json\n[\n  { \"name\": \"Vitamin D3\", \"level\": \"Deficient\", \"pathway\": \"Immune Modulation / T-reg / Neuroprotection\" },\n  { \"name\": \"Glutathione (GSH)\", \"level\": \"Low\", \"pathway\": \"Antioxidant / Oligodendrocyte Protection\" },\n  { \"name\": \"CoQ10\", \"level\": \"Low\", \"pathway\": \"Mitochondrial Respiration / Axonal Energy\" },\n  { \"name\": \"Vitamin B12\", \"level\": \"Low-normal\", \"pathway\": \"Myelin Synthesis / Methylation\" },\n  { \"name\": \"Homocysteine\", \"level\": \"Elevated\", \"pathway\": \"Cardiovascular / Neurotoxicity\" },\n  { \"name\": \"Magnesium\", \"level\": \"Low\", \"pathway\": \"NMDA / Spasticity / Sleep\" },\n  { \"name\": \"Zinc\", \"level\": \"Low-normal\", \"pathway\": \"Immune / Blood-Brain Barrier\" }\n]\n```\n\n### Detected Deficiencies & MS Relevance\n- **Vitamin D3 (Deficient at 18 ng/mL)**: The most important modifiable risk factor in RRMS. Low D3 is associated with higher relapse rates, faster disability accumulation, and increased MRI lesion burden. Target: 60-80 ng/mL.\n- **Glutathione (Low at 1.1 μmol/g Hb)**: Oligodendrocytes (the cells that make myelin) are exquisitely sensitive to oxidative stress. Depleted GSH accelerates demyelination.\n- **CoQ10 (Low at 0.38 μg/mL)**: Demyelinated axons require dramatically more energy to conduct signals. Low CoQ10 = mitochondrial failure = axonal degeneration.\n- **Homocysteine (Elevated at 14.1 μmol/L)**: Neurotoxic at elevated levels; impairs myelin synthesis and increases BBB permeability.\n\n### Precision Nutrient Protocol\n| Intervention/Molecule | Therapeutic Dose | Delivery | Targeted Pathway |\n|---|---|---|---|\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | T-reg upregulation / Neuroprotection |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Oligodendrocyte shield |\n| CoQ10 (Ubiquinol) | 200mg BID | Oral with fat | Mitochondrial Complex I-III rescue |\n| Methylcobalamin (B12) | 1000mcg sublingual | Daily | Myelin synthesis / Homocysteine clearance |\n| L-Methylfolate (5-MTHF) | 800mcg | Oral | Methylation cycle / Homocysteine clearance |\n| Alpha-Lipoic Acid (R-ALA) | 600mg | Oral | BBB-crossing antioxidant / Neuroprotection |\n| Magnesium Glycinate | 400mg | Oral, nightly | NMDA modulation / Spasticity / Sleep |\n\n### Cautions & Interactions\n- **Vitamin D3 + Ocrevus**: Monitor calcium levels quarterly; immunosuppression + high-dose D3 requires careful calcium homeostasis surveillance.\n- **NAC + Escitalopram**: NAC may modulate glutamatergic neurotransmission; generally synergistic with SSRIs but monitor for mood changes.\n- **Alpha-Lipoic Acid + Blood Sugar**: R-ALA can lower blood glucose; monitor if Mara ever starts corticosteroids for relapse treatment.\n- **B12 Supplementation**: Use methylcobalamin form specifically — cyanocobalamin requires hepatic conversion that may be impaired in MS."
        }
      },
      {
        "type": "Visit",
        "date": "2026.03.10",
        "summary": "Post-infusion follow-up. Fatigue worsening, gait instability noted. NfL drawn — elevated at 18.2 pg/mL.",
        "state": {
          "patientGoals": "Address worsening fatigue and leg stiffness.",
          "vitals": {
            "bp": "110/70",
            "hr": "78",
            "temp": "98.2°F",
            "spO2": "97%",
            "weight": "140 lbs",
            "height": "5'6\""
          },
          "oxidativeStressMarkers": [],
          "antioxidantSources": [],
          "medications": [
            {
              "id": "1",
              "name": "Ocrevus",
              "value": "600mg IV q6mo"
            },
            {
              "id": "2",
              "name": "Baclofen",
              "value": "10mg TID"
            }
          ],
          "issues": {
            "lower_back": [
              {
                "id": "lower_back",
                "noteId": "note_mara_back_hist1",
                "name": "Lower Extremities",
                "painLevel": 4,
                "description": "Increasing morning stiffness in both legs. Using cane more frequently.",
                "symptoms": []
              }
            ]
          }
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  }
] as any[];

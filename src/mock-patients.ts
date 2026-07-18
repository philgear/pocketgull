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
  },
  {
    "id": "p_frida_kahlo",
    "name": "Frida Kahlo",
    "age": 47,
    "gender": "Female",
    "lastVisit": "1954.07.13",
    "preexistingConditions": [
      "Poliomyelitis (childhood, right leg atrophy)",
      "Severe streetcar accident trauma (1925)",
      "Multiple spinal fractures & pelvic fractures",
      "Right foot amputation (1953)",
      "Chronic neuropathic pain"
    ],
    "patientGoals": "Manage chronic, intractable neuropathic pain, support spinal stability, and address severe right leg/foot phantom pain.",
    "vitals": {
      "bp": "115/75",
      "hr": "82",
      "temp": "98.4°F",
      "spO2": "97%",
      "weight": "110 lbs",
      "height": "5'3\""
    },
    "issues": {
      "spine": [
        {
          "id": "spine",
          "noteId": "note_frida_spine_1",
          "name": "Spinal & Pelvic Trauma",
          "painLevel": 8,
          "description": "Chronic pain, spinal instability requiring steel corsets. Post-operative status of 30+ surgeries.",
          "symptoms": [
            {
              "name": "Severe back pain",
              "type": "Neuropathic",
              "verified": true,
              "timeline": "Chronic"
            }
          ]
        }
      ],
      "r_leg": [
        {
          "id": "r_leg",
          "noteId": "note_frida_leg_1",
          "name": "Right Leg Atrophy & Amputation",
          "painLevel": 9,
          "description": "Right leg exhibits marked atrophy (post-polio). Right foot/lower leg amputated in 1953 due to gangrene, resulting in severe phantom limb sensations and burning.",
          "symptoms": [
            {
              "name": "Phantom foot pain",
              "type": "Neuropathic",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Right lower leg atrophy",
              "type": "Musculoskeletal",
              "verified": true,
              "timeline": "Chronic"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "NoteCreated",
        "date": "1925.09.17",
        "summary": "Survived catastrophic streetcar collision resulting in an iron handrail piercing her pelvis and multiple spinal/foot fractures."
      },
      {
        "type": "AnalysisRun",
        "date": "1954.07.13",
        "summary": "Historical Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nFrida Kahlo presents with complex, refractory chronic neuropathic pain secondary to childhood polio and subsequent high-impact orthopedic trauma. She is post-amputation of the right lower extremity, experiencing severe phantom limb pain, spinal subluxation/pain, and dependency on strong analgesics (Demerol, alcohol).\n\n### Plan of Care\n- **Mirror Box Therapy**: Initiate visual feedback sessions targeting the right lower extremity phantom sensations.\n- **Somatic Myofascial Release**: Gentle upper spine/cervical therapy to reduce strain from wearing structural corsets.\n- **Neuropathic Pain Support**: Utilize high-dose liposomal palmitoylethanolamide (PEA) and alpha-lipoic acid.",
          "Functional Protocols": "### Immediate Actions\n- Start Mirror Box training 15 mins BID.\n- Implement daily heart rate variability (HRV) breathing exercises to modulate sympathetic tone."
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p_edwin_smith_3",
    "name": "Edwin Smith Case 3",
    "age": 30,
    "gender": "Male",
    "lastVisit": "-1600.01.01",
    "preexistingConditions": [
      "Traumatic Skull Fracture",
      "Meningeal exposure",
      "Cervical rigidity"
    ],
    "patientGoals": "Stabilize acute head injury, wound care, and address neck stiffness.",
    "vitals": {
      "bp": "110/70",
      "hr": "64",
      "temp": "99.2°F",
      "spO2": "95%",
      "weight": "150 lbs",
      "height": "5'7\""
    },
    "issues": {
      "head": [
        {
          "id": "head",
          "noteId": "note_smith_head_1",
          "name": "Skull & Cervical Spine Trauma",
          "painLevel": 9,
          "description": "Gaping wound in the head penetrating to the bone, smashing the skull. Patient is unable to look at his shoulders, suggesting severe cervical spine stiffness / meningeal irritation.",
          "symptoms": [
            {
              "name": "Gaping head wound",
              "type": "Trauma",
              "verified": true,
              "timeline": "Acute"
            },
            {
              "name": "Cervical rigidity (stiff neck)",
              "type": "Neurological",
              "verified": true,
              "timeline": "Acute"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "NoteCreated",
        "date": "-1600.01.01",
        "summary": "Edwin Smith Papyrus Case 3 record: An ailment not to be treated. Bind with fresh meat on the first day, followed by grease, honey, and lint daily."
      },
      {
        "type": "AnalysisRun",
        "date": "-1600.01.01",
        "summary": "Historical Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nPatient presents with a severe, acute open traumatic brain injury (TBI) with exposed skull fractures and significant cervical rigidity. Historically classified as 'an ailment not to be treated' due to high mortality.\n\n### Plan of Care\n- Immediate wound stabilization and sterile debridement (modern equivalent of grease/honey dressing).\n- Immobilization of the cervical spine to prevent secondary spinal cord injury.\n- Close intracranial pressure (ICP) monitoring.",
          "Functional Protocols": "### Immediate Actions\n- Rigid cervical collar placement.\n- High-potency topical antimicrobial honey dressing (Medihoney) to promote tissue recovery and prevent wound contamination."
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  },
  {
    "id": "p_charles_darwin",
    "name": "Charles Darwin",
    "age": 73,
    "gender": "Male",
    "lastVisit": "1882.04.19",
    "preexistingConditions": [
      "Chronic Gastrointestinal Disease",
      "Cyclic Vomiting Syndrome (suspected)",
      "Systemic eczema & skin rashes",
      "Mitochondrial dysfunction / Chagas disease (suspected)"
    ],
    "patientGoals": "Resolve debilitating chronic fatigue, severe episodic vomiting, flatulence, and chest palpitations.",
    "vitals": {
      "bp": "110/70",
      "hr": "68",
      "temp": "98.2°F",
      "spO2": "96%",
      "weight": "148 lbs",
      "height": "5'11\""
    },
    "issues": {
      "abdomen": [
        {
          "id": "abdomen",
          "noteId": "note_darwin_gut_1",
          "name": "Chronic Gastrointestinal Syndrome",
          "painLevel": 6,
          "description": "Debilitating abdominal pain, severe flatulence, acid reflux, and cyclical episodes of vomiting triggered by stress or intellectual exertion.",
          "symptoms": [
            {
              "name": "Cyclic vomiting",
              "type": "Gastrointestinal",
              "verified": true,
              "timeline": "Chronic/Episodic"
            },
            {
              "name": "Severe flatulence & dyspepsia",
              "type": "Gastrointestinal",
              "verified": true,
              "timeline": "Chronic"
            }
          ]
        }
      ],
      "chest": [
        {
          "id": "chest",
          "noteId": "note_darwin_chest_1",
          "name": "Cardiac Palpitations",
          "painLevel": 4,
          "description": "Recurrent palpitations and chest discomfort, typically co-occurring with episodes of anxiety or intense focus.",
          "symptoms": [
            {
              "name": "Palpitations",
              "type": "Cardiovascular",
              "verified": true,
              "timeline": "Intermittent"
            }
          ]
        }
      ],
      "full_body": [
        {
          "id": "full_body",
          "noteId": "note_darwin_systemic_1",
          "name": "Systemic Fatigue & Dermatological Flare-ups",
          "painLevel": 5,
          "description": "Profound, post-exertional fatigue rendering him bedridden for days, accompanied by weeping eczema and skin rashes.",
          "symptoms": [
            {
              "name": "Chronic fatigue",
              "type": "Systemic/Mitochondrial",
              "verified": true,
              "timeline": "Chronic"
            },
            {
              "name": "Eczematous skin rashes",
              "type": "Dermatological",
              "verified": true,
              "timeline": "Chronic"
            }
          ]
        }
      ]
    },
    "history": [
      {
        "type": "NoteCreated",
        "date": "1839.12.31",
        "summary": "Onboard HMS Beagle, exposed to various tropical diseases (including suspected Triatoma infestans bites, vector of Chagas disease)."
      },
      {
        "type": "AnalysisRun",
        "date": "1882.04.19",
        "summary": "Historical Clinical Analysis",
        "report": {
          "Summary Overview": "### Clinical Assessment\nCharles Darwin presents with a multi-systemic syndrome characterized by chronic gut-brain axis dysfunction, cyclical hyperemesis, cardiac palpitations, and eczematous skin issues. Pointing towards either chronic Chagas disease, food intolerance, or mitochondrial dysfunction.\n\n### Plan of Care\n- **Strict Gluten-Free & Lactose-Free Diet**: Eliminate inflammatory dietary proteins.\n- **Mitochondrial Support**: Supplement with CoQ10, Riboflavin (B2), and Carnitine.\n- **Vagus Nerve Stimulation**: Cold exposure and diaphragmatic breathing.",
          "Functional Protocols": "### Immediate Actions\n- Complete elimination of dairy and wheat product intake.\n- Initiate CoQ10 200mg daily with fat-containing meals."
        }
      }
    ],
    "bookmarks": [],
    "scans": []
  }
] as any[];

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
  Bookmark,
  HistoryEntry,
  Patient,
  PatientState,
  BodyPartIssue,
  DiagnosticScan
} from "./patient.types";
import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'pocket-gull-clinical-vault-key-poc';

// Re-export for use in other components
export type { BodyPartIssue, HistoryEntry, Patient };

// Mock Data
const MOCK_PATIENTS: Patient[] = [
  {
    id: "p001",
    name: "Robert Davis",
    age: 58,
    gender: "Male",
    lastVisit: "2024.11.20",
    preexistingConditions: [
      "Essential Hypertension",
      "Type 2 Diabetes Mellitus",
      "Obesity (BMI 42)",
      "Severe Obstructive Sleep Apnea",
      "Metabolic Syndrome",
    ],
    patientGoals:
      "Discuss CPAP compliance issues and weight management strategies.",
    vitals: {
      bp: "152/95",
      hr: "88",
      temp: "98.4°F",
      spO2: "94%",
      weight: "295 lbs",
      height: "5'10\"",
    },
    oxidativeStressMarkers: [
      {
        id: "1",
        name: "Malondialdehyde (MDA)",
        value: "3.8 μmol/L",
      },
      {
        id: "2",
        name: "F2-Isoprostanes",
        value: "45 pg/mg creatinine",
      },
    ],
    antioxidantSources: [
      {
        id: "1",
        name: "Glutathione (GSH)",
        value: "1.2 μmol/g Hb",
      },
      {
        id: "2",
        name: "CoQ10",
        value: "0.45 μg/mL",
      },
    ],
    medications: [
      {
        id: "1",
        name: "Lisinopril",
        value: "20mg Daily",
      },
      {
        id: "2",
        name: "Metformin",
        value: "1000mg BID",
      },
      {
        id: "3",
        name: "Atorvastatin",
        value: "40mg Daily",
      },
    ],
    biometricHistory: [
      { timestamp: "2023-10-01T09:00:00Z", type: "hr", value: "95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "hr", value: "92" },
      { timestamp: "2023-12-20T09:00:00Z", type: "hr", value: "88" },
      { timestamp: "2024-01-25T09:00:00Z", type: "hr", value: "85" },
      { timestamp: "2024-02-28T09:00:00Z", type: "hr", value: "82" },
      { timestamp: "2024-03-30T09:00:00Z", type: "hr", value: "78" },
      { timestamp: "2023-10-01T09:00:00Z", type: "spO2", value: "92" },
      { timestamp: "2023-11-15T09:00:00Z", type: "spO2", value: "93" },
      { timestamp: "2023-12-20T09:00:00Z", type: "spO2", value: "95" },
      { timestamp: "2024-01-25T09:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2024-02-28T09:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2024-03-30T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2023-10-01T09:00:00Z", type: "bp", value: "150/95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "bp", value: "145/90" },
      { timestamp: "2023-12-20T09:00:00Z", type: "bp", value: "138/85" },
      { timestamp: "2024-01-25T09:00:00Z", type: "bp", value: "130/82" },
      { timestamp: "2024-02-28T09:00:00Z", type: "bp", value: "128/80" },
      { timestamp: "2024-03-30T09:00:00Z", type: "bp", value: "120/80" }
    ],
    issues: {
      chest: [
        {
          id: "chest",
          noteId: "note_p001_chest_1",
          name: "Chest & Lungs",
          painLevel: 1,
          description:
            "Reports waking up gasping for air frequently. Daytime somnolence affecting work performance.",
          symptoms: [],
        },
      ],
      head: [
        {
          id: "head",
          noteId: "note_p001_head_1",
          name: "Head & Neck",
          painLevel: 2,
          description:
            "Morning headaches nearly every day, likely secondary to hypoxemia and OSA.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nRobert Davis presents with a complex clinical picture primarily characterized by Chest & Lungs, Head & Neck. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Robert's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Robert should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2024.10.10",
        summary: "Initial consultation for sleep study follow-up.",
        state: {
          patientGoals: "Review sleep study results.",
          vitals: {
            bp: "148/92",
            hr: "85",
            temp: "98.6°F",
            spO2: "96%",
            weight: "298 lbs",
            height: "5'10\"",
          },
          oxidativeStressMarkers: [
            {
              id: "1",
              name: "Malondialdehyde (MDA)",
              value: "3.6 μmol/L",
            },
          ],
          antioxidantSources: [
            {
              id: "1",
              name: "Glutathione (GSH)",
              value: "1.4 μmol/g Hb",
            },
          ],
          medications: [
            {
              id: "1",
              name: "Lisinopril",
              value: "20mg Daily",
            },
            {
              id: "2",
              name: "Metformin",
              value: "1000mg BID",
            },
            {
              id: "3",
              name: "Atorvastatin",
              value: "40mg Daily",
            },
          ],
          issues: {},
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_003",
        type: "X-Ray",
        title: "PA and Lateral Chest",
        date: "2024.10.12",
        bodyPartId: "chest",
        description:
          "Bilateral hyperinflation consistent with COPD. No focal consolidation, pneumothorax or pleural effusion. Borderline cardiomegaly.",
        status: "Reviewed",
        imageUrl:
          "/assets/images/640px-Chest_xray_mac.jpg",
      },
    ],
  },
  {
    id: "p002",
    name: "Sarah Jenkins",
    age: 42,
    gender: "Female",
    lastVisit: "2024.12.01",
    preexistingConditions: [
      "Asthma",
      "Anxiety Disorder",
      "Chronic Lower Back Pain",
      "Opioid Use Disorder (in remission)",
      "Depression",
    ],
    patientGoals:
      "Seeking alternative pain management options to avoid opioid relapse.",
    vitals: {
      bp: "118/72",
      hr: "76",
      temp: "98.2°F",
      spO2: "99%",
      weight: "145 lbs",
      height: "5'5\"",
    },
    oxidativeStressMarkers: [],
    antioxidantSources: [
      {
        id: "1",
        name: "Vitamin C",
        value: "1.2 mg/dL",
      },
    ],
    medications: [
      {
        id: "1",
        name: "Albuterol Inhaler",
        value: "2 puffs PRN",
      },
      {
        id: "2",
        name: "Sertraline",
        value: "50mg Daily",
      },
      {
        id: "3",
        name: "Gabapentin",
        value: "300mg TID",
      },
      {
        id: "4",
        name: "Ibuprofen",
        value: "600mg PRN MSK Pain",
      },
    ],
    biometricHistory: [
      { timestamp: "2023-10-01T09:00:00Z", type: "hr", value: "95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "hr", value: "92" },
      { timestamp: "2023-12-20T09:00:00Z", type: "hr", value: "88" },
      { timestamp: "2024-01-25T09:00:00Z", type: "hr", value: "85" },
      { timestamp: "2024-02-28T09:00:00Z", type: "hr", value: "82" },
      { timestamp: "2024-03-30T09:00:00Z", type: "hr", value: "78" },
      { timestamp: "2023-10-01T09:00:00Z", type: "spO2", value: "92" },
      { timestamp: "2023-11-15T09:00:00Z", type: "spO2", value: "93" },
      { timestamp: "2023-12-20T09:00:00Z", type: "spO2", value: "95" },
      { timestamp: "2024-01-25T09:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2024-02-28T09:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2024-03-30T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2023-10-01T09:00:00Z", type: "bp", value: "150/95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "bp", value: "145/90" },
      { timestamp: "2023-12-20T09:00:00Z", type: "bp", value: "138/85" },
      { timestamp: "2024-01-25T09:00:00Z", type: "bp", value: "130/82" },
      { timestamp: "2024-02-28T09:00:00Z", type: "bp", value: "128/80" },
      { timestamp: "2024-03-30T09:00:00Z", type: "bp", value: "120/80" }
    ],
    issues: {
      mid_back: [
        {
          id: "mid_back",
          noteId: "note_p002_back_1",
          name: "Lower Back",
          painLevel: 7,
          description:
            "Constant aching pain in L4-L5 region radiating to the left glute. Worsens with prolonged standing.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nSarah Jenkins presents with a complex clinical picture primarily characterized by Lower Back. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Sarah's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Sarah should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2024.10.15",
        summary:
          "Discussion of physical therapy and cognitive behavioral therapy for pain.",
        state: {
          patientGoals: "Need help managing flare-ups without medication.",
          vitals: {
            bp: "120/75",
            hr: "74",
            temp: "98.5°F",
            spO2: "99%",
            weight: "148 lbs",
            height: "5'5\"",
          },
          oxidativeStressMarkers: [],
          antioxidantSources: [],
          medications: [
            {
              id: "1",
              name: "Albuterol Inhaler",
              value: "2 puffs PRN",
            },
            {
              id: "2",
              name: "Sertraline",
              value: "50mg Daily",
            },
            {
              id: "3",
              name: "Gabapentin",
              value: "300mg TID",
            },
          ],
          issues: {
            mid_back: [
              {
                id: "mid_back",
                noteId: "note_p002_back_hist1",
                name: "Lower Back",
                painLevel: 6,
                description:
                  "Pain has been increasing recently due to work stress.",
                symptoms: [],
              },
            ],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_001",
        type: "MRI",
        title: "Lumbar Spine MRI",
        date: "2024.11.15",
        bodyPartId: "lower_back",
        description:
          "L4-L5 disc desiccation and mild paracentral disc protrusion without significant canal stenosis. Mild bilateral neural foraminal narrowing.",
        status: "Reviewed",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/1/1a/MRI_of_the_Lumbar_Spine_%28Sagittal_View%29.jpg",
      },
      {
        id: "scan_002",
        type: "X-Ray",
        title: "Lumbar Spine AP/Lateral X-Ray",
        date: "2024.11.02",
        bodyPartId: "lower_back",
        description:
          "Normal alignment. No fracture or acute bony abnormality. Mild degenerative disc disease at L4-L5.",
        status: "Reviewed",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/34/Lateral_lumbar_x_ray.jpg",
      },
    ],
  },
  {
    id: "p003",
    name: "William Henderson",
    age: 81,
    gender: "Male",
    lastVisit: "2024.12.05",
    preexistingConditions: [
      "Ischemic Heart Disease",
      "Chronic Kidney Disease",
      "Mild Cognitive Impairment / Early Alzheimer's",
      "Osteoarthritis",
      "Fall Risk",
    ],
    patientGoals:
      "Family requested evaluation for increased confusion and recent fall at home.",
    vitals: {
      bp: "135/82",
      hr: "68",
      temp: "97.9°F",
      spO2: "97%",
      weight: "162 lbs",
      height: "5'9\"",
    },
    oxidativeStressMarkers: [
      {
        id: "1",
        name: "8-OHdG",
        value: "15 ng/mg creatinine",
      },
      {
        id: "2",
        name: "Lipid Peroxides",
        value: "12 nmol/mL",
      },
    ],
    antioxidantSources: [
      {
        id: "1",
        name: "Alpha-Tocopherol",
        value: "11.5 mg/L",
      },
    ],
    medications: [
      {
        id: "1",
        name: "Donepezil",
        value: "5mg Daily",
      },
      {
        id: "2",
        name: "Aspirin",
        value: "81mg Daily",
      },
      {
        id: "3",
        name: "Furosemide",
        value: "20mg Daily",
      },
      {
        id: "4",
        name: "Acetaminophen",
        value: "500mg PRN OA Pain",
      },
    ],
    biometricHistory: [
      { timestamp: "2023-10-01T09:00:00Z", type: "hr", value: "95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "hr", value: "92" },
      { timestamp: "2023-12-20T09:00:00Z", type: "hr", value: "88" },
      { timestamp: "2024-01-25T09:00:00Z", type: "hr", value: "85" },
      { timestamp: "2024-02-28T09:00:00Z", type: "hr", value: "82" },
      { timestamp: "2024-03-30T09:00:00Z", type: "hr", value: "78" },
      { timestamp: "2023-10-01T09:00:00Z", type: "spO2", value: "92" },
      { timestamp: "2023-11-15T09:00:00Z", type: "spO2", value: "93" },
      { timestamp: "2023-12-20T09:00:00Z", type: "spO2", value: "95" },
      { timestamp: "2024-01-25T09:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2024-02-28T09:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2024-03-30T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2023-10-01T09:00:00Z", type: "bp", value: "150/95" },
      { timestamp: "2023-11-15T09:00:00Z", type: "bp", value: "145/90" },
      { timestamp: "2023-12-20T09:00:00Z", type: "bp", value: "138/85" },
      { timestamp: "2024-01-25T09:00:00Z", type: "bp", value: "130/82" },
      { timestamp: "2024-02-28T09:00:00Z", type: "bp", value: "128/80" },
      { timestamp: "2024-03-30T09:00:00Z", type: "bp", value: "120/80" }
    ],
    issues: {
      head: [
        {
          id: "head",
          noteId: "note_p003_head_1",
          name: "Brain & Cognition",
          painLevel: 0,
          description:
            "Daughter reports patient got lost returning from the grocery store yesterday. Requires prompting for ADLs. MoCA score: 18/30.",
          symptoms: [],
        },
      ],
      r_arm: [
        {
          id: "r_arm",
          noteId: "note_p003_arm_1",
          name: "Right Arm / Wrist",
          painLevel: 4,
          description:
            "Bruising and tenderness from mechanical fall two days ago. X-ray negative for fracture.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nWilliam Henderson presents with a complex clinical picture primarily characterized by Brain & Cognition, Right Arm / Wrist. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of William's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. William should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2024.06.12",
        summary: "6-month geriatric assessment.",
        state: {
          patientGoals: "Routine check, family notes mild forgetfulness.",
          vitals: {
            bp: "130/80",
            hr: "70",
            temp: "98.1°F",
            spO2: "98%",
            weight: "165 lbs",
            height: "5'9\"",
          },
          oxidativeStressMarkers: [
            {
              id: "1",
              name: "8-OHdG",
              value: "10 ng/mg creatinine",
            },
          ],
          antioxidantSources: [
            {
              id: "1",
              name: "Alpha-Tocopherol",
              value: "12.0 mg/L",
            },
          ],
          medications: [
            {
              id: "1",
              name: "Donepezil",
              value: "5mg Daily",
            },
            {
              id: "2",
              name: "Aspirin",
              value: "81mg Daily",
            },
            {
              id: "3",
              name: "Furosemide",
              value: "20mg Daily",
            },
          ],
          issues: {
            head: [
              {
                id: "head",
                noteId: "note_p003_head_hist2",
                name: "Brain & Cognition",
                painLevel: 0,
                description: "Mild short-term memory deficits noted.",
                symptoms: [],
              },
            ],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_004",
        type: "CT Scan",
        title: "Non-Contrast Head CT",
        date: "2024.12.04",
        bodyPartId: "head",
        description:
          "Mild diffuse age-related volume loss. No acute intracranial hemorrhage or mass effect. Tiny focal areas of chronic microvascular ischemic disease.",
        status: "Reviewed",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/62/CT_scan_of_the_brain.jpg",
      },
      {
        id: "scan_005",
        type: "X-Ray",
        title: "Right Forearm/Wrist",
        date: "2024.12.04",
        bodyPartId: "r_arm",
        description:
          "No acute displaced fracture or dislocation. Degenerative changes in radiocarpal joint.",
        status: "Reviewed",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/6f/X-Ray_of_Colles_Fracture.jpg",
      },
    ],
  },
  {
    id: "p004",
    name: "Global Sentinel",
    age: 72,
    gender: "Other",
    lastVisit: "2026.03.12",
    preexistingConditions: [],
    patientGoals:
      "Evaluate global mortality risks and complex multimorbidity presentation.",
    vitals: {
      bp: "155/95",
      hr: "88",
      temp: "98.6°F",
      spO2: "92%",
      weight: "185 lbs",
      height: "5'8\"",
    },
    issues: {
      full_body: [
        {
          id: "full_body",
          noteId: "note_p004_full_1",
          name: "Systemic Health",
          painLevel: 5,
          description:
            "Patient exhibits clinical signs or risks associated with the top 10 global causes of death based on WHO 2021 estimates.",
          symptoms: [
            {
              name: "Ischaemic heart disease",
              type: "Cardiovascular",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "COVID-19",
              type: "Respiratory/Infectious",
              verified: true,
              timeline: "Acute/Chronic",
            },
            {
              name: "Stroke",
              type: "Neurological/Cardiovascular",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Chronic obstructive pulmonary disease (COPD)",
              type: "Respiratory",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Lower respiratory infections",
              type: "Respiratory/Infectious",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Trachea, bronchus, and lung cancers",
              type: "Oncology",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Alzheimer's disease and other dementias",
              type: "Neurological",
              verified: true,
              timeline: "Progressive",
            },
            {
              name: "Diabetes mellitus",
              type: "Metabolic",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Kidney diseases",
              type: "Renal",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Hypertensive heart disease",
              type: "Cardiovascular",
              verified: true,
              timeline: "Chronic",
            },
          ],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nGlobal Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Global's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Global should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2026.03.12",
        summary: "Comprehensive review of multimorbidity indicators.",
        state: {
          patientGoals: "Evaluate global mortality risks.",
          vitals: {
            bp: "155/95",
            hr: "88",
            temp: "98.6°F",
            spO2: "92%",
            weight: "185 lbs",
            height: "5'8\"",
          },
          issues: {},
        },
      },
    ],
    bookmarks: [],
    scans: [],
  },
  {
    id: "p005",
    name: "CDC Sentinel",
    age: 78,
    gender: "Other",
    lastVisit: "2026.03.12",
    preexistingConditions: [],
    patientGoals:
      "Evaluate US mortality risks and complex multimorbidity presentation.",
    vitals: {
      bp: "148/92",
      hr: "82",
      temp: "98.4°F",
      spO2: "94%",
      weight: "195 lbs",
      height: "5'9\"",
    },
    issues: {
      full_body: [
        {
          id: "full_body",
          noteId: "note_p005_full_1",
          name: "Systemic Health",
          painLevel: 6,
          description:
            "Patient exhibits clinical signs or risks associated with the top 10 leading causes of death in the US based on CDC 2023 provisional data.",
          symptoms: [
            {
              name: "Heart disease",
              type: "Cardiovascular",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Cancer",
              type: "Oncology",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Unintentional injuries",
              type: "Trauma",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Stroke (cerebrovascular diseases)",
              type: "Neurological/Cardiovascular",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Chronic lower respiratory diseases",
              type: "Respiratory",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Alzheimer's disease",
              type: "Neurological",
              verified: true,
              timeline: "Progressive",
            },
            {
              name: "Diabetes mellitus",
              type: "Metabolic",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Nephritis, nephrotic syndrome, and nephrosis",
              type: "Renal",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Chronic liver disease and cirrhosis",
              type: "Hepatic",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "COVID-19",
              type: "Respiratory/Infectious",
              verified: true,
              timeline: "Acute/Chronic",
            },
          ],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nCDC Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of CDC's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. CDC should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2026.03.12",
        summary:
          "Comprehensive review of leading national mortality indicators.",
        state: {
          patientGoals: "Evaluate national mortality risks.",
          vitals: {
            bp: "148/92",
            hr: "82",
            temp: "98.4°F",
            spO2: "94%",
            weight: "195 lbs",
            height: "5'9\"",
          },
          issues: {},
        },
      },
    ],
    bookmarks: [],
    scans: [],
  },
  {
    id: "p006",
    name: "Pediatric Sentinel",
    age: 4,
    gender: "Male",
    lastVisit: "2026.03.12",
    preexistingConditions: [],
    patientGoals: "Evaluate global pediatric mortality risks (Under 5).",
    vitals: {
      bp: "95/60",
      hr: "110",
      temp: "99.1°F",
      spO2: "96%",
      weight: "35 lbs",
      height: "3'4\"",
    },
    issues: {
      full_body: [
        {
          id: "full_body",
          noteId: "note_p006_full_1",
          name: "Systemic Health",
          painLevel: 4,
          description:
            "Patient exhibits clinical signs or risks associated with the top causes of global under-5 child mortality.",
          symptoms: [
            {
              name: "Preterm birth complications",
              type: "Neonatal",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Lower respiratory infections (Pneumonia)",
              type: "Respiratory/Infectious",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Intrapartum-related events (Birth Asphyxia/Trauma)",
              type: "Neonatal/Trauma",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Diarrhoeal diseases",
              type: "Gastrointestinal/Infectious",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Congenital anomalies",
              type: "Congenital",
              verified: true,
              timeline: "Chronic",
            },
            {
              name: "Malaria",
              type: "Infectious",
              verified: true,
              timeline: "Acute",
            },
          ],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nPediatric Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Pediatric's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Pediatric should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2026.03.12",
        summary:
          "Comprehensive review of leading pediatric mortality indicators.",
        state: {
          patientGoals: "Evaluate pediatric mortality risks.",
          vitals: {
            bp: "95/60",
            hr: "110",
            temp: "99.1°F",
            spO2: "96%",
            weight: "35 lbs",
            height: "3'4\"",
          },
          issues: {},
        },
      },
    ],
    bookmarks: [],
    scans: [],
  },
  {
    id: "p007",
    name: "Maternal Sentinel",
    age: 28,
    gender: "Female",
    lastVisit: "2026.03.12",
    preexistingConditions: [],
    patientGoals: "Evaluate global maternal mortality risks.",
    vitals: {
      bp: "135/85",
      hr: "90",
      temp: "98.8°F",
      spO2: "98%",
      weight: "165 lbs",
      height: "5'6\"",
    },
    issues: {
      full_body: [
        {
          id: "full_body",
          noteId: "note_p007_full_1",
          name: "Systemic Health",
          painLevel: 7,
          description:
            "Patient exhibits clinical signs or risks associated with the top causes of maternal mortality.",
          symptoms: [
            {
              name: "Severe bleeding (Hemorrhage)",
              type: "Obstetric/Cardiovascular",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Infections (Sepsis)",
              type: "Infectious",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Gestational Hypertension (Pre-eclampsia/Eclampsia)",
              type: "Cardiovascular/Obstetric",
              verified: true,
              timeline: "Acute/Chronic",
            },
            {
              name: "Complications from delivery",
              type: "Obstetric",
              verified: true,
              timeline: "Acute",
            },
            {
              name: "Unsafe abortion complications",
              type: "Obstetric/Trauma",
              verified: true,
              timeline: "Acute",
            },
          ],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nMaternal Sentinel presents with a complex clinical picture primarily characterized by Systemic Health. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Maternal's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Maternal should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "Visit",
        date: "2026.03.12",
        summary:
          "Comprehensive review of leading maternal mortality indicators.",
        state: {
          patientGoals: "Evaluate maternal mortality risks.",
          vitals: {
            bp: "135/85",
            hr: "90",
            temp: "98.8°F",
            spO2: "98%",
            weight: "165 lbs",
            height: "5'6\"",
          },
          issues: {},
        },
      },
    ],
    bookmarks: [],
  },
  {
    id: "p008",
    name: "Linus P (Functional Profile)",
    age: 93,
    gender: "Male",
    lastVisit: "2024.12.10",
    preexistingConditions: [
      "Prostate Cancer",
      "Coronary Artery Disease",
      "Macular Degeneration",
    ],
    patientGoals:
      "Evaluate high-dose ascorbic acid therapy and Lp(a) management.",
    vitals: {
      bp: "125/78",
      hr: "68",
      temp: "98.2°F",
      spO2: "98%",
      weight: "165 lbs",
      height: "5'10\"",
      vitC: "10000",
      vitD3: "85",
      magnesium: "6.5",
      zinc: "120",
      b12: "1200",
    },
    oxidativeStressMarkers: [
      {
        id: "1",
        name: "Oxidative Stress",
        value: "2.5",
      },
    ],
    antioxidantSources: [
      {
        id: "1",
        name: "Antioxidant Status",
        value: "9.2",
      },
    ],
    medications: [],
    issues: {
      chest: [
        {
          id: "chest",
          noteId: "note_p008_chest_1",
          name: "Cardiovascular",
          painLevel: 1,
          description:
            "Mild angina on heavy exertion. Managing with Pauling therapy.",
          symptoms: [],
        },
      ],
      pelvis: [
        {
          id: "pelvis",
          noteId: "note_p008_pelvis_1",
          name: "Prostate",
          painLevel: 2,
          description:
            "PSA stable at 4.2. Monitoring oxidative stress markers.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "AnalysisRun",
        date: "2026.03.12",
        summary: "Comprehensive Clinical Analysis",
        report: {
          "Summary Overview":
            "### Clinical Assessment\nLinus P (Functional Profile) presents with a complex clinical picture primarily characterized by Cardiovascular, Prostate. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
          "Functional Protocols":
            "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
          Nutrition:
            "### Biochemical Assessment\nAnalysis of Linus's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
          "Monitoring & Follow-up":
            "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Linus should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
          "Patient Education":
            "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        },
      },
      {
        type: "ChartArchived",
        date: "2024.10.10",
        summary: "Initiated Pauling Therapy (Vit C + Lysine + Proline).",
        state: {
          patientGoals: "Reduce lipoprotein(a) levels and arterial plaque.",
          vitals: {
            bp: "135/85",
            hr: "72",
            temp: "98.4°F",
            spO2: "97%",
            weight: "168 lbs",
            height: "5'10\"",
            vitC: "3000",
            vitD3: "45",
            magnesium: "4.2",
            zinc: "85",
            b12: "600",
          },
          oxidativeStressMarkers: [
            {
              id: "1",
              name: "Oxidative Stress",
              value: "6.8",
            },
          ],
          antioxidantSources: [
            {
              id: "1",
              name: "Antioxidant Status",
              value: "4.5",
            },
          ],
          medications: [],
          dynamicNutrients: [
            {
              id: "1",
              name: "L-Lysine",
              value: "3000 mg",
            },
            {
              id: "2",
              name: "L-Proline",
              value: "1500 mg",
            },
            {
              id: "3",
              name: "Lipoprotein(a)",
              value: "150 mg/dL",
            },
          ],
          issues: {},
        },
      },
      {
        type: "ChartArchived",
        date: "2024.11.10",
        summary: "One month follow-up on Pauling Therapy.",
        state: {
          patientGoals: "Titrating dose to bowel tolerance.",
          vitals: {
            bp: "130/80",
            hr: "70",
            temp: "98.3°F",
            spO2: "98%",
            weight: "166 lbs",
            height: "5'10\"",
            vitC: "6000",
            vitD3: "65",
            magnesium: "5.5",
            zinc: "105",
            b12: "900",
          },
          oxidativeStressMarkers: [
            {
              id: "1",
              name: "Oxidative Stress",
              value: "4.2",
            },
          ],
          antioxidantSources: [
            {
              id: "1",
              name: "Antioxidant Status",
              value: "7.1",
            },
          ],
          medications: [],
          dynamicNutrients: [
            {
              id: "1",
              name: "L-Lysine",
              value: "5000 mg",
            },
            {
              id: "2",
              name: "L-Proline",
              value: "2500 mg",
            },
            {
              id: "3",
              name: "Lipoprotein(a)",
              value: "95 mg/dL",
            },
          ],
          issues: {},
        },
      },
      {
        type: "Visit",
        date: "2024.12.10",
        summary: "Two month follow-up. Symptoms improving.",
        state: {
          patientGoals:
            "Evaluate high-dose ascorbic acid therapy and Lp(a) management.",
          vitals: {
            bp: "125/78",
            hr: "68",
            temp: "98.2°F",
            spO2: "98%",
            weight: "165 lbs",
            height: "5'10\"",
            vitC: "10000",
            vitD3: "85",
            magnesium: "6.5",
            zinc: "120",
            b12: "1200",
          },
          oxidativeStressMarkers: [
            {
              id: "1",
              name: "Oxidative Stress",
              value: "2.5",
            },
          ],
          antioxidantSources: [
            {
              id: "1",
              name: "Antioxidant Status",
              value: "9.2",
            },
          ],
          medications: [],
          dynamicNutrients: [
            {
              id: "1",
              name: "L-Lysine",
              value: "6000 mg",
            },
            {
              id: "2",
              name: "L-Proline",
              value: "3000 mg",
            },
            {
              id: "3",
              name: "Lipoprotein(a)",
              value: "30 mg/dL",
            },
            {
              id: "4",
              name: "CoQ10",
              value: "400 mg",
            },
          ],
          issues: {},
        },
      },
    ],
    bookmarks: [],
    scans: [],
  },
  {
    id: "p009",
    name: "Maya Chen",
    age: 34,
    gender: "Female",
    lastVisit: "2026.03.18",
    preexistingConditions: [
      "Hashimoto's Thyroiditis",
      "Systemic Lupus Erythematosus (SLE)",
      "Iron-Deficiency Anemia",
      "Raynaud's Phenomenon",
    ],
    patientGoals:
      "Seeking a functional medicine approach to reduce SLE flare frequency and improve energy levels without increasing immunosuppressant dosing.",
    vitals: {
      bp: "108/68",
      hr: "82",
      temp: "99.1°F",
      spO2: "98%",
      weight: "128 lbs",
      height: "5'4\"",
      vitD3: "22",
      magnesium: "3.8",
      b12: "310",
    },
    oxidativeStressMarkers: [
      { id: "1", name: "8-OHdG", value: "18 ng/mg creatinine" },
      { id: "2", name: "Malondialdehyde (MDA)", value: "4.2 μmol/L" },
      { id: "3", name: "Anti-dsDNA Antibodies", value: "85 IU/mL (High)" },
    ],
    antioxidantSources: [
      { id: "1", name: "Glutathione (GSH)", value: "0.8 μmol/g Hb (Low)" },
      { id: "2", name: "Vitamin D3 (25-OH)", value: "22 ng/mL (Deficient)" },
      { id: "3", name: "Ferritin", value: "8 ng/mL (Low)" },
    ],
    medications: [
      { id: "1", name: "Hydroxychloroquine", value: "200mg BID" },
      { id: "2", name: "Levothyroxine", value: "75mcg Daily (AM, fasting)" },
      { id: "3", name: "Ferrous Sulfate", value: "325mg Daily" },
      { id: "4", name: "Prednisone", value: "5mg Daily (taper in progress)" },
    ],
    biometricHistory: [
      { timestamp: "2025-09-01T08:00:00Z", type: "hr", value: "94" },
      { timestamp: "2025-10-15T08:00:00Z", type: "hr", value: "91" },
      { timestamp: "2025-11-01T08:00:00Z", type: "hr", value: "88" },
      { timestamp: "2025-12-01T08:00:00Z", type: "hr", value: "85" },
      { timestamp: "2026-01-15T08:00:00Z", type: "hr", value: "84" },
      { timestamp: "2026-03-18T08:00:00Z", type: "hr", value: "82" },
      { timestamp: "2025-09-01T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2025-10-15T08:00:00Z", type: "spO2", value: "97" },
      { timestamp: "2025-12-01T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2026-03-18T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2025-09-01T08:00:00Z", type: "bp", value: "112/70" },
      { timestamp: "2025-11-01T08:00:00Z", type: "bp", value: "110/68" },
      { timestamp: "2026-01-15T08:00:00Z", type: "bp", value: "108/68" },
      { timestamp: "2026-03-18T08:00:00Z", type: "bp", value: "108/68" },
    ],
    issues: {
      head: [
        {
          id: "head",
          noteId: "note_p009_head_1",
          name: "Cognitive & Neurological",
          painLevel: 3,
          description:
            "Reports persistent 'brain fog,' difficulty concentrating at work, and word-finding lapses. TSH most recently 3.8 mIU/L — suboptimally controlled on current Levothyroxine dose.",
          symptoms: [],
        },
      ],
      chest: [
        {
          id: "chest",
          noteId: "note_p009_chest_1",
          name: "Chest & Lungs",
          painLevel: 2,
          description:
            "Intermittent pleuritic chest pain consistent with serositis during SLE flares. Echo showed trace pericardial effusion 4 months ago. Currently resolved.",
          symptoms: [],
        },
      ],
      r_hand: [
        {
          id: "r_hand",
          noteId: "note_p009_rhand_1",
          name: "Right Hand & Wrist — Raynaud's",
          painLevel: 4,
          description:
            "Raynaud's attacks are triggered by cold and stress, averaging 3–4 episodes/week in winter. Fingers blanch, then turn blue, then red upon rewarming. Causes significant functional limitation during flares.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "Visit",
        date: "2026.03.18",
        summary:
          "Functional medicine intake. Discussed SLE flare triggers, thyroid optimization, and iron repletion.",
        state: {
          patientGoals:
            "Reduce SLE flares and improve energy. Explore non-pharmacologic immune modulation.",
          vitals: {
            bp: "108/68",
            hr: "82",
            temp: "99.1°F",
            spO2: "98%",
            weight: "128 lbs",
            height: "5'4\"",
            vitD3: "22",
            magnesium: "3.8",
            b12: "310",
          },
          oxidativeStressMarkers: [
            { id: "1", name: "8-OHdG", value: "18 ng/mg creatinine" },
            { id: "2", name: "Anti-dsDNA Antibodies", value: "85 IU/mL (High)" },
          ],
          antioxidantSources: [
            { id: "1", name: "Glutathione (GSH)", value: "0.8 μmol/g Hb (Low)" },
            { id: "2", name: "Ferritin", value: "8 ng/mL (Low)" },
          ],
          medications: [
            { id: "1", name: "Hydroxychloroquine", value: "200mg BID" },
            { id: "2", name: "Levothyroxine", value: "75mcg Daily" },
            { id: "3", name: "Prednisone", value: "10mg Daily" },
          ],
          issues: {
            head: [
              {
                id: "head",
                noteId: "note_p009_head_hist1",
                name: "Cognitive & Neurological",
                painLevel: 5,
                description: "Severe brain fog during active flare. Unable to complete work tasks.",
                symptoms: [],
              },
            ],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_p009_001",
        type: "Lab Report",
        title: "Comprehensive Autoimmune Panel",
        date: "2026.03.10",
        bodyPartId: "chest",
        description:
          "ANA titer: 1:320 (speckled pattern). Anti-dsDNA: 85 IU/mL. C3: 68 mg/dL (Low). C4: 9 mg/dL (Low). TSH: 3.8 mIU/mL. Free T4: 0.9 ng/dL. Ferritin: 8 ng/mL. Suggests active SLE with complement consumption.",
        status: "Abnormal",
      },
    ],
  },
  {
    id: "p010",
    name: "Marcus Thompson",
    age: 51,
    gender: "Male",
    lastVisit: "2026.03.20",
    preexistingConditions: [
      "Coronary Artery Disease (post-stent, 2023)",
      "Type 2 Diabetes Mellitus (A1c improving)",
      "Hypertriglyceridemia",
      "Non-Alcoholic Fatty Liver Disease (NAFLD)",
      "Former Smoker (quit 2023)",
    ],
    patientGoals:
      "Aggressively reduce cardiovascular risk after 2023 NSTEMI. Aiming for metabolic reversal of T2DM via lifestyle intervention. Current A1c: 6.4% (down from 9.1%).",
    vitals: {
      bp: "126/78",
      hr: "62",
      temp: "98.3°F",
      spO2: "99%",
      weight: "218 lbs",
      height: "6'1\"",
    },
    oxidativeStressMarkers: [
      { id: "1", name: "hsCRP", value: "2.1 mg/L (Elevated)" },
      { id: "2", name: "Lipoprotein(a)", value: "65 mg/dL (Elevated)" },
      { id: "3", name: "Malondialdehyde (MDA)", value: "2.8 μmol/L" },
    ],
    antioxidantSources: [
      { id: "1", name: "CoQ10", value: "0.38 μg/mL (Low — statin-related)" },
      { id: "2", name: "Omega-3 Index", value: "4.2% (Target >8%)" },
    ],
    medications: [
      { id: "1", name: "Rosuvastatin", value: "40mg Daily" },
      { id: "2", name: "Aspirin", value: "81mg Daily" },
      { id: "3", name: "Clopidogrel", value: "75mg Daily" },
      { id: "4", name: "Metformin", value: "500mg BID (reduced from 1000mg BID)" },
      { id: "5", name: "Empagliflozin", value: "10mg Daily" },
      { id: "6", name: "Ramipril", value: "5mg Daily" },
    ],
    biometricHistory: [
      { timestamp: "2023-06-15T09:00:00Z", type: "hr", value: "88" },
      { timestamp: "2023-09-01T09:00:00Z", type: "hr", value: "80" },
      { timestamp: "2023-12-01T09:00:00Z", type: "hr", value: "74" },
      { timestamp: "2024-03-01T09:00:00Z", type: "hr", value: "70" },
      { timestamp: "2024-09-01T09:00:00Z", type: "hr", value: "66" },
      { timestamp: "2026-03-20T09:00:00Z", type: "hr", value: "62" },
      { timestamp: "2023-06-15T09:00:00Z", type: "spO2", value: "96" },
      { timestamp: "2024-03-01T09:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2026-03-20T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2023-06-15T09:00:00Z", type: "bp", value: "148/94" },
      { timestamp: "2023-09-01T09:00:00Z", type: "bp", value: "140/88" },
      { timestamp: "2023-12-01T09:00:00Z", type: "bp", value: "134/84" },
      { timestamp: "2024-03-01T09:00:00Z", type: "bp", value: "130/82" },
      { timestamp: "2024-09-01T09:00:00Z", type: "bp", value: "128/80" },
      { timestamp: "2026-03-20T09:00:00Z", type: "bp", value: "126/78" },
    ],
    issues: {
      chest: [
        {
          id: "chest",
          noteId: "note_p010_chest_1",
          name: "Cardiovascular",
          painLevel: 1,
          description:
            "Post-NSTEMI (LAD stent placed June 2023). Currently asymptomatic on dual antiplatelet therapy. Recent nuclear stress test negative for ischemia. Echo EF: 52% (up from 44% at discharge).",
          symptoms: [],
        },
      ],
      abdomen: [
        {
          id: "abdomen",
          noteId: "note_p010_abd_1",
          name: "Liver & GI — NAFLD",
          painLevel: 0,
          description:
            "NAFLD confirmed by FibroScan (CAP 285 dB/m, E: 6.2 kPa — steatosis grade S2, no significant fibrosis). AST/ALT normalizing as weight decreases. Diet adherence is strong.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "Visit",
        date: "2026.03.20",
        summary: "6-month cardiology & functional medicine follow-up. Trending well across all CVD risk factors.",
        state: {
          patientGoals: "Achieve metabolic reversal of T2DM. Target A1c < 6.0% within 6 months.",
          vitals: {
            bp: "126/78",
            hr: "62",
            temp: "98.3°F",
            spO2: "99%",
            weight: "218 lbs",
            height: "6'1\"",
          },
          oxidativeStressMarkers: [
            { id: "1", name: "hsCRP", value: "2.1 mg/L" },
            { id: "2", name: "Lipoprotein(a)", value: "65 mg/dL" },
          ],
          antioxidantSources: [
            { id: "1", name: "CoQ10", value: "0.38 μg/mL (Low)" },
          ],
          medications: [
            { id: "1", name: "Rosuvastatin", value: "40mg Daily" },
            { id: "2", name: "Aspirin", value: "81mg Daily" },
            { id: "3", name: "Clopidogrel", value: "75mg Daily" },
            { id: "4", name: "Metformin", value: "500mg BID" },
            { id: "5", name: "Empagliflozin", value: "10mg Daily" },
            { id: "6", name: "Ramipril", value: "5mg Daily" },
          ],
          issues: {
            chest: [
              {
                id: "chest",
                noteId: "note_p010_chest_hist1",
                name: "Cardiovascular",
                painLevel: 1,
                description: "Asymptomatic. EF improved to 52%. All vitals trending towards target.",
                symptoms: [],
              },
            ],
          },
        },
      },
      {
        type: "Visit",
        date: "2023.06.28",
        summary: "Post-discharge follow-up. 2 weeks after NSTEMI and LAD stent placement.",
        state: {
          patientGoals: "Recover from cardiac event. Understand medications and lifestyle changes required.",
          vitals: {
            bp: "148/94",
            hr: "88",
            temp: "98.7°F",
            spO2: "96%",
            weight: "254 lbs",
            height: "6'1\"",
          },
          oxidativeStressMarkers: [],
          antioxidantSources: [],
          medications: [
            { id: "1", name: "Rosuvastatin", value: "40mg Daily" },
            { id: "2", name: "Aspirin", value: "81mg Daily" },
            { id: "3", name: "Clopidogrel", value: "75mg Daily" },
            { id: "4", name: "Metformin", value: "1000mg BID" },
            { id: "5", name: "Ramipril", value: "2.5mg Daily" },
          ],
          issues: {
            chest: [
              {
                id: "chest",
                noteId: "note_p010_chest_hist2",
                name: "Cardiovascular — Post NSTEMI",
                painLevel: 5,
                description: "Post-stent. Residual exertional angina on stairs. EF 44% on echo. A1c: 9.1%. Active smoker until event date.",
                symptoms: [],
              },
            ],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_p010_001",
        type: "Lab Report",
        title: "Cardiometabolic Panel — March 2026",
        date: "2026.03.15",
        bodyPartId: "chest",
        description:
          "LDL-C: 58 mg/dL (at goal). HDL: 42 mg/dL. Triglycerides: 185 mg/dL (improved from 420). A1c: 6.4%. Fasting glucose: 98 mg/dL. hsCRP: 2.1 mg/dL. Lp(a): 65 mg/dL. ALT: 32 U/L (improving). AST: 28 U/L.",
        status: "Reviewed",
      },
    ],
  },
  {
    id: "p011",
    name: "Elena Vasquez",
    age: 35,
    gender: "Female",
    lastVisit: "2026.03.22",
    preexistingConditions: [
      "Crohn's Disease (Ileocolonic, moderate-severity)",
      "Major Depressive Disorder (recurrent)",
      "Generalized Anxiety Disorder",
      "Small Intestinal Bacterial Overgrowth (SIBO)",
      "Vitamin B12 Deficiency (malabsorption)",
    ],
    patientGoals:
      "Achieve clinical and endoscopic remission in Crohn's. Improve mood stability. Explore the gut-brain axis connection to reduce anxiety and depression severity.",
    vitals: {
      bp: "112/72",
      hr: "78",
      temp: "98.6°F",
      spO2: "99%",
      weight: "120 lbs",
      height: "5'4\"",
      vitD3: "18",
      b12: "195",
      magnesium: "3.5",
    },
    oxidativeStressMarkers: [
      { id: "1", name: "Fecal Calprotectin", value: "320 μg/g (High)" },
      { id: "2", name: "hsCRP", value: "4.8 mg/L (Elevated)" },
      { id: "3", name: "Lactulose/Mannitol Ratio", value: "0.045 (Elevated — Leaky Gut)" },
    ],
    antioxidantSources: [
      { id: "1", name: "Vitamin B12 (serum)", value: "195 pg/mL (Deficient)" },
      { id: "2", name: "Vitamin D3 (25-OH)", value: "18 ng/mL (Deficient)" },
      { id: "3", name: "Zinc", value: "62 μg/dL (Low-normal)" },
    ],
    medications: [
      { id: "1", name: "Vedolizumab", value: "300mg IV q8 weeks" },
      { id: "2", name: "Budesonide", value: "9mg Daily (induction, tapering)" },
      { id: "3", name: "Escitalopram", value: "10mg Daily" },
      { id: "4", name: "Vitamin B12 (Methylcobalamin)", value: "1000mcg IM Monthly" },
      { id: "5", name: "Rifaximin", value: "550mg TID x 14 days (SIBO treatment)" },
    ],
    biometricHistory: [
      { timestamp: "2025-07-01T08:00:00Z", type: "hr", value: "95" },
      { timestamp: "2025-09-15T08:00:00Z", type: "hr", value: "88" },
      { timestamp: "2025-11-01T08:00:00Z", type: "hr", value: "84" },
      { timestamp: "2026-01-15T08:00:00Z", type: "hr", value: "81" },
      { timestamp: "2026-03-22T08:00:00Z", type: "hr", value: "78" },
      { timestamp: "2025-07-01T08:00:00Z", type: "spO2", value: "98" },
      { timestamp: "2026-03-22T08:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2025-07-01T08:00:00Z", type: "bp", value: "118/74" },
      { timestamp: "2025-11-01T08:00:00Z", type: "bp", value: "114/72" },
      { timestamp: "2026-03-22T08:00:00Z", type: "bp", value: "112/72" },
    ],
    issues: {
      abdomen: [
        {
          id: "abdomen",
          noteId: "note_p011_abd_1",
          name: "Abdomen — Crohn's & SIBO",
          painLevel: 6,
          description:
            "Reporting 4–6 loose stools/day with cramping. SIBO confirmed by lactulose breath test (peak CH4: 22 ppm). Crohn's activity index (CDAI): 240 (moderate). Colonoscopy 3 months ago showed active ileitis with skip lesions. Currently initiating Vedolizumab.",
          symptoms: [],
        },
      ],
      head: [
        {
          id: "head",
          noteId: "note_p011_head_1",
          name: "Mental Health — MDD & GAD",
          painLevel: 5,
          description:
            "PHQ-9: 14 (moderate depression). GAD-7: 12 (moderate anxiety). Reports sleep onset insomnia and early-morning awakening. Flare-related stress significantly worsens psychiatric symptoms. Exploring correlation between gut inflammation (calprotectin) and mood state.",
          symptoms: [],
        },
      ],
    },
    history: [
      {
        type: "Visit",
        date: "2026.03.22",
        summary:
          "Integrative GI/psychiatry intake. Discussed gut-brain axis, microbiome restoration, and B12 repletion urgency.",
        state: {
          patientGoals:
            "Achieve Crohn's remission and improve baseline mood. Restore gut microbiome. Correct nutritional deficiencies.",
          vitals: {
            bp: "112/72",
            hr: "78",
            temp: "98.6°F",
            spO2: "99%",
            weight: "120 lbs",
            height: "5'4\"",
            vitD3: "18",
            b12: "195",
          },
          oxidativeStressMarkers: [
            { id: "1", name: "Fecal Calprotectin", value: "320 μg/g (High)" },
            { id: "2", name: "hsCRP", value: "4.8 mg/L" },
          ],
          antioxidantSources: [
            { id: "1", name: "Vitamin B12 (serum)", value: "195 pg/mL (Deficient)" },
            { id: "2", name: "Vitamin D3 (25-OH)", value: "18 ng/mL" },
          ],
          medications: [
            { id: "1", name: "Vedolizumab", value: "300mg IV q8 weeks" },
            { id: "2", name: "Budesonide", value: "9mg Daily" },
            { id: "3", name: "Escitalopram", value: "10mg Daily" },
            { id: "4", name: "Rifaximin", value: "550mg TID x 14 days" },
          ],
          issues: {
            abdomen: [
              {
                id: "abdomen",
                noteId: "note_p011_abd_hist1",
                name: "Abdomen — Crohn's Active Flare",
                painLevel: 7,
                description: "Active flare. 6+ loose stools/day. Cramping 8/10. Weight down 8 lbs from baseline.",
                symptoms: [],
              },
            ],
          },
        },
      },
    ],
    bookmarks: [],
    scans: [
      {
        id: "scan_p011_001",
        type: "Lab Report",
        title: "GI Biomarker & Nutritional Panel",
        date: "2026.03.18",
        bodyPartId: "abdomen",
        description:
          "Fecal calprotectin: 320 μg/g. hsCRP: 4.8 mg/L. ESR: 42 mm/hr. B12: 195 pg/mL. Folate: 4.2 ng/mL. Vitamin D: 18 ng/mL. Zinc: 62 μg/dL. Lactulose breath test positive for SIBO (CH4-dominant). CBC: Mild normocytic anemia (Hgb 10.8 g/dL).",
        status: "Abnormal",
      },
    ],
  },
  {
    id: "p012",
    name: "Emma Clark",
    age: 28,
    gender: "Female",
    lastVisit: "2026.03.24",
    preexistingConditions: [],
    patientGoals: "Establish baseline health metrics and maintain annual wellness routine.",
    vitals: {
      bp: "116/74",
      hr: "68",
      temp: "98.4°F",
      spO2: "99%",
      weight: "135 lbs",
      height: "5'6\"",
      vitD3: "45",
      b12: "650",
      magnesium: "6.2",
    },
    oxidativeStressMarkers: [],
    antioxidantSources: [],
    medications: [],
    biometricHistory: [
      { timestamp: "2025-06-15T09:00:00Z", type: "hr", value: "70" },
      { timestamp: "2026-03-24T09:00:00Z", type: "hr", value: "68" },
      { timestamp: "2025-06-15T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2026-03-24T09:00:00Z", type: "spO2", value: "99" },
      { timestamp: "2025-06-15T09:00:00Z", type: "bp", value: "115/75" },
      { timestamp: "2026-03-24T09:00:00Z", type: "bp", value: "116/74" },
    ],
    issues: {},
    history: [
      {
        type: "Visit",
        date: "2026.03.24",
        summary: "Annual wellness exam. Patient is healthy and active. Discussed continuing current lifestyle.",
        state: {
          patientGoals: "Maintain current health status.",
          vitals: {
            bp: "116/74",
            hr: "68",
            temp: "98.4°F",
            spO2: "99%",
            weight: "135 lbs",
            height: "5'6\"",
          },
          oxidativeStressMarkers: [],
          antioxidantSources: [],
          medications: [],
          issues: {}
        }
      }
    ],
    bookmarks: [],
    scans: []
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

  readonly patients = signal<Patient[]>(MOCK_PATIENTS);
  readonly selectedPatientId: WritableSignal<string | null> = signal(
    MOCK_PATIENTS.find(p => p.id === 'p012')?.id || MOCK_PATIENTS[0]?.id || null,
  );
  readonly selectedPatient = computed(() => {
    const id = this.selectedPatientId();
    return id ? this.patients().find((p) => p.id === id) : null;
  });

  private async initRoster() {
    if (typeof window !== 'undefined') {
        const loaded = await this.storage.loadPatients();
        if (loaded && loaded.length > 0) {
            this.patients.set(loaded);
            this.selectedPatientId.set(loaded[0]?.id || null);
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
  createNewPatient() {
    this.saveCurrentPatientState();

    const newPatientId = `p_${Date.now()}`;
    const newPatient: Patient = {
      id: newPatientId,
      name: "New Patient",
      age: 0,
      gender: "Other",
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

  /** Imports a pre-built Patient object (from JSON or FHIR import). */
  importPatient(patient: Patient) {
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
      gender: Patient["gender"];
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
  addBookmark(bookmark: Bookmark) {
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
  addScan(scan: DiagnosticScan) {
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
  updateBookmark(url: string, updates: Partial<Bookmark>) {
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

        // Create a mutable copy of the patient
        const updatedPatient = { ...p, issues: { ...p.issues } };

        // 1. Remove note from issues
        const issuesForPart = updatedPatient.issues[noteEntry.partId] || [];
        const updatedIssuesForPart = issuesForPart.filter(
          (i) => i.noteId !== noteEntry.noteId,
        );

        if (updatedIssuesForPart.length > 0) {
          updatedPatient.issues[noteEntry.partId] = updatedIssuesForPart;
        } else {
          delete updatedPatient.issues[noteEntry.partId];
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
    const patientResource = bundle.entry.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
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

        // Vitals
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

    const newPatient: Patient = {
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
      await firstValueFrom(this.http.post("/api/patients", patientsToSync));
      console.log("[PatientManagementService] Successfully synced to cloud");
      return true;
    } catch (error) {
      console.error("[PatientManagementService] Error syncing to cloud", error);
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

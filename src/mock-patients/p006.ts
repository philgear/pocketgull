import { IPatient } from '../services/patient.types';

export const p006: IPatient = {
  "id": "p006",
  "name": "Pediatric Sentinel",
  "age": 4,
  "gender": "Male",
  "lastVisit": "2026.03.12",
  "preexistingConditions": [
    "Preterm Birth History (32 weeks gestation)",
    "Mild-Intermittent Asthma",
    "Recent Rotavirus Enteritis (Resolving)"
  ],
  "patientGoals": "Rehydrate after diarrhoeal episode, reduce airway hyperreactivity, and support pediatric immune health.",
  "vitals": {
    "bp": "95/60",
    "hr": "112",
    "temp": "99.1°F",
    "spO2": "96%",
    "weight": "34 lbs",
    "height": "3'4\""
  },
  "issues": {
    "chest": [
      {
        "id": "chest",
        "noteId": "note_p006_chest_1",
        "name": "Bronchial Hyperreactivity (Post-Viral Cough)",
        "painLevel": 3,
        "description": "Exhibits post-viral bronchial irritation with mild expiratory wheezing. Responds well to occasional albuterol nebulization.",
        "symptoms": [
          {
            "name": "Dry cough",
            "type": "Respiratory",
            "verified": true,
            "timeline": "Acute"
          },
          {
            "name": "Mild expiratory wheeze",
            "type": "Respiratory",
            "verified": true,
            "timeline": "Acute"
          }
        ]
      }
    ],
    "abdomen": [
      {
        "id": "abdomen",
        "noteId": "note_p006_abdomen_1",
        "name": "Gastroenteritis & Dehydration Recovery",
        "painLevel": 4,
        "description": "Recovering from multiple episodes of watery diarrhea. Oral intake is improving, but displays slightly dry mucous membranes.",
        "symptoms": [
          {
            "name": "Watery diarrhea",
            "type": "Gastrointestinal",
            "verified": true,
            "timeline": "Acute"
          },
          {
            "name": "Dry mouth & increased thirst",
            "type": "Gastrointestinal",
            "verified": true,
            "timeline": "Acute"
          }
        ]
      }
    ],
    "full_body": [
      {
        "id": "full_body",
        "noteId": "note_p006_full_1",
        "name": "Preterm History & Growth Monitoring",
        "painLevel": 0,
        "description": "Born prematurely at 32 weeks. Currently tracking steadily along the 25th percentile curves for height and weight. Motor milestones intact.",
        "symptoms": [
          {
            "name": "History of preterm delivery complications",
            "type": "Neonatal",
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
      "summary": "Pediatric Sentinel Health and Development Assessment",
      "report": {
        "Summary Overview": "### Clinical Assessment\nPediatric Sentinel is a 4-year-old male recovering from childhood diarrhoeal illness and post-viral bronchial hyperreactivity (asthma flare). Born prematurely at 32 weeks, he requires careful respiratory support, rapid oral rehydration therapy, zinc supplementation to shorten diarrhoeal course, and gut flora rebuilding.\n\n### Priority List\n*   **Rehydration & Electrolyte Restoration**: Replace fluid losses and support gastrointestinal mucosal recovery.\n*   **Respiratory Optimization**: Calm reactive airways and reduce wheezing episodes.\n*   **Nutritional Optimization**: Replete micronutrients (especially Zinc and Vitamin A) essential for childhood mucosal immunity.\n\n### Plan of Care\n*   Implement strict Oral Rehydration Therapy (ORT) protocol with electrolyte solution.\n*   Administer Zinc drops daily for 10-14 days to reduce diarrhoeal recurrence.\n*   Utilize cool-mist humidifier at night; administer albuterol as prescribed for wheezing.\n\n### Goals\n*   **Short-term (48 hours)**: Complete resolution of dehydration signs (moist mucous membranes, normal urine output).\n*   **Long-term (1 month)**: No expiratory wheezing at rest; return to solid baseline diet with age-appropriate weight progression.",
        "Functional Protocols": "### Immediate Actions (To start within 24 hours)\n*   Give 50-100 mL of Oral Rehydration Solution (ORS) after each loose stool.\n*   Initiate pediatric zinc supplementation.\n*   Keep child upright for 30 minutes after eating to minimize cough triggers.\n\n### Foundation (Diet & Lifestyle)\n*   **Diet**: Simple, nutrient-dense, easily digestible foods (bananas, rice, applesauce, toast, soft broths). Avoid high-sugar juices that worsen diarrhea.\n*   **Environment**: Dust-free, allergen-free bedroom environment; enforce hands-off smoke exposure policies.\n*   **Sleep**: Humidified air at night to keep bronchial secretions thin.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Oral Rehydration Salts (ORS) | As needed | Throughout day | Rehydrate and replace lost electrolytes |\n| Zinc Sulfate | 20mg | Morning | WHO guideline for under-5 diarrhoeal recovery |\n| Lactobacillus rhamnosus GG | 5 billion CFU | Afternoon | Re-establish beneficial gut bacteria post-enteritis |\n| Vitamin A | 100,000 IU (one-time dose) | AM | Support mucosal epithelial barrier integrity |",
        "Nutrition": "### Biochemical Assessment\nDiarrhoeal losses deplete vital trace minerals and dehydrate epithelial tissue. Restoring tight junctions in both the gut and respiratory tract is paramount.\n\n### Nutrition Targets\n*   **Epithelial Recovery**: Vitamin A and Zinc are core co-factors in epithelial tissue synthesis.\n*   **Microbiome Stabilization**: Probiotics reduce duration of acute infectious diarrhea.\n*   **Osmotic Balance**: Low-sugar liquids to prevent osmotic pull into the colon.\n\n### Dietary Adjustments\nOffer frequent small sips of broth, coconut water, or ORS. Transition to steamed carrots, pureed squash, and oatmeal as tolerance improves.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-7 days)\n1.  Assess hydration status every 4 hours (urine output, tears when crying, skin turgor).\n2.  Log stool frequency and consistency.\n3.  Monitor respiratory rate during sleep (target < 30 breaths/minute).\n\n### Ongoing (Month 1)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Hydration State | Moist mouth, tears present | Daily | No wet diapers/urination for 8+ hours |\n| Respiratory Rate | < 28 breaths/min at rest | Daily | Retractions (chest pulling in) or tachypnea |\n| Diarrheal Stools | 0-1 per day | Daily | Blood in stool or fever > 102°F |"
      }
    },
    {
      "type": "Visit",
      "date": "2026.03.12",
      "summary": "Evaluation of pediatric mortality risks. Addressed childhood bronchial hyperreactivity and diarrhoeal enteritis recovery.",
      "state": {
        "patientGoals": "Evaluate global pediatric mortality risks (Under 5).",
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
};

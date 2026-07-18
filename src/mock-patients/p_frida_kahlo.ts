import { IPatient } from '../services/patient.types';

export const p_frida_kahlo: IPatient = {
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
      "summary": "Survived catastrophic streetcar collision resulting in an iron handrail piercing her pelvis and multiple spinal/foot fractures.",
      "partId": "spine",
      "noteId": "note_frida_spine_1"
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
};

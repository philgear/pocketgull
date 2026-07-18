import { IPatient } from '../services/patient.types';

export const p_charles_darwin: IPatient = {
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
      "summary": "Onboard HMS Beagle, exposed to various tropical diseases (including suspected Triatoma infestans bites, vector of Chagas disease).",
      "partId": "full_body",
      "noteId": "note_darwin_systemic_1"
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
};

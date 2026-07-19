import { IPatient } from '../services/patient.types';

export const p_edwin_smith_3: IPatient = {
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
      "summary": "Edwin Smith Papyrus Case 3 record: An ailment not to be treated. Bind with fresh meat on the first day, followed by grease, honey, and lint daily.",
      "partId": "head",
      "noteId": "note_smith_head_1"
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
};

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
        "Summary Overview": "### Clinical Assessment\nCharles Darwin presents with a multi-systemic syndrome characterized by chronic gut-brain axis dysfunction, cyclical hyperemesis (cyclic vomiting syndrome), cardiac palpitations, and system-wide eczematous skin flare-ups. His presentation suggests chronic dysbiosis, systemic food intolerances (celiac/lactose sensitivity), and mitochondrial dysfunction, potentially exacerbated by historical exposure to Chagas disease (HMS Beagle bites).\n\n### Priority List\n- **Gluten & Casein Elimination**: Highest priority to resolve chronic mucosal irritation, flatulence, and cyclical emesis.\n- **Mitochondrial & Cardiac Optimization**: Support heart rhythm and energy production with key cofactors.\n- **Vagal Tone Enhancement**: Coregulate the hyperactive gut-brain axis through diaphragmatic breathing and cold hydrotherapy.\n\n### Plan of Care\n- Transition immediately to a grain-free, dairy-free diet utilizing local, nutrient-dense whole foods.\n- Supplement daily mitochondrial cofactors to address cellular fatigue.\n- Implement vagal nerve stimulation exercises twice daily to lower emotional and physiological stress triggers.",
        "Functional Protocols": "### Immediate Actions\n- **Dietary Purge**: Remove all wheat, barley, rye, and dairy products. Cook all vegetables thoroughly to reduce lectins and fiber-induced gas.\n- **Mitochondrial Therapy**: Supplement CoQ10 (200mg/day) and Riboflavin (B2, 400mg/day) to restore cellular energy output.\n- **Hydrotherapy**: Daily 3-minute cold water chest compresses to stimulate vagal response.\n\n### Vagal & Circadian Rhythm Support\n- Diaphragmatic breathing exercises (5 seconds in, 5 seconds out) for 10 minutes prior to eating to optimize digestive enzyme secretion.",
        "Nutrition": "### Victorian Dietary Context & Abundance\nLiving at Down House in Kent, Mr. Darwin has access to an abundance of high-quality, whole foods that can replace inflammatory Victorian staples (like heavy wheat-flour puddings, unpasteurized milk, and refined sugar):\n\n- **Kentish Coast Wild Seafood**: Wild mackerel, herring, and native oysters are abundant and rich in anti-inflammatory Omega-3 fatty acids to resolve his eczema and cardiac palpitations.\n- **Down House Kitchen Gardens**: Thoroughly cooked leafy greens (spinach, cabbage), root vegetables, and herbs provide critical trace minerals and antioxidants without triggering his flatulence.\n- **Orchard & Poultry Coops**: Freshly collected chicken/duck eggs provide highly bioavailable proteins and choline for brain health, while stewed apples/pears (cooked to break down complex sugars) support intestinal barrier repair.\n\n### Inflammatory Victorian Foods to Avoid\n- **Heavy Yeasted Breads & Suet Puddings**: Highly inflammatory wheat gluten triggers his gut barrier breakdown.\n- **Raw Cow's Milk**: Lactose and A1 casein promote gut inflammation and cyclic emesis.\n- **Mercury-laden Patent Medicines**: Discontinue all 'blue pill' formulations as they degrade the gut lining and neurological function.",
        "Precision Nutrients": "### Orthomolecular Co-Factor Protocol\n\n| Nutrient | Victorian Food Source | Supplement Dose | Clinical Target |\n| :--- | :--- | :--- | :--- |\n| **Coenzyme Q10** | Mackerel, Heart Meats | 200 mg / day | Mitochondrial ETC / Palpitations |\n| **Riboflavin (B2)** | Egg Yolks, Wild Game | 400 mg / day | Krebs Cycle Energy Production |\n| **Omega-3 (EPA/DHA)** | Oysters, Mackerel | 3000 mg / day | Eczema Resolution & Cellular Membranes |\n| **L-Carnitine** | Mutton, Beef | 1000 mg / day | Fatty Acid Transportation |\n| **Magnesium** | Spinach, Sea Salt | 400 mg / day | Smooth Muscle Relaxation & Vagal Tone |\n\n### Clinical Notes\nEnsure all supplements are administered with fat-containing meals (such as egg yolks or pheasant fat) to optimize absorption of fat-soluble cofactors.",
        "Monitoring & Follow-up": "### Key Clinical Milestones\n\n1. **Weeks 1-2**: Assess frequency of cyclic vomiting episodes. Target is zero hyperemesis events.\n2. **Week 4**: Evaluate skin integrity. Eczema should show a 30% reduction in surface area and weeping.\n3. **Month 3**: Re-evaluate cardiac palpitations and flatulence. Monitor energy levels during cognitive exertion (writing/researching).\n\n| Parameter | Target | Frequency | Action Trigger |\n| :--- | :--- | :--- | :--- |\n| **Vomiting Episodes** | 0 episodes | Weekly | Any episode requires immediate dietary audit |\n| **Flatulence Severity** | Mild/None | Daily | Severe gas indicates high-lectin vegetable load |\n| **Cardiac Palpitations** | < 2 per week | Daily | Daily episodes trigger magnesium dose adjustment |\n\n### Long-Term Prognosis\nBy adhering to a clean, non-inflammatory dietary regime that bypasses Victorian gut-toxins, Mr. Darwin's systemic fatigue should subside, allowing for prolonged periods of intellectual focus and scientific research without triggering cyclic physical collapses.",
        "Patient Education": "### Understanding Your Gut-Brain Connection\nYour severe stomach issues, headaches, and chest palpitations are not isolated symptoms; they are closely connected. When your gut lining becomes irritated by wheat (gluten) and dairy (casein), it sends stress signals directly to your heart and brain via the vagus nerve.\n\n### Critical Actions\n1. **Eat Simply**: Stick to game meats, wild fish, eggs, and well-cooked garden vegetables.\n2. **Avoid Victorian Comforts**: Say no to milk, beer, and sweet puddings.\n3. **Breathe & Rest**: Do not engage in intense scientific writing immediately after meals. Give your body 30 minutes of rest to digest simply and cleanly."
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};

const payload = {
  patientPayload: {
    patient_id: "test_patient_123",
    encounter_timestamp: "2026-03-18T12:00:00Z",
    gender: "Male",
    age_years: 45,
    active_diagnoses: ["Hypertension"],
    vitals: [
      {
        recorded_at: "2026-03-18T12:00:00Z",
        heart_rate_bpm: 75,
        systolic_bp: 120,
        diastolic_bp: 80,
        temperature_celsius: 37.0,
        weight_kg: 80.5,
        clinical_notes: "JOHN DOE was seen today. Email: test@example.com."
      }
    ]
  }
};

fetch('https://pocket-gull-v2-793190615625.us-west1.run.app/api/export/bigquery', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(res => res.text())
.then(console.log)
.catch(console.error);

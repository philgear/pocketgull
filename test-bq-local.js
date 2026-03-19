import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({ projectId: 'gen-lang-client-0540208645' });
const datasetId = 'pocket_gull_analytics';
const tableId = 'patient_encounters';

const payload = {
    patient_id: "test_patient_123",
    encounter_timestamp: new Date().toISOString(),
    gender: "Male",
    age_years: 45,
    active_diagnoses: ["Hypertension"],
    vitals: [{
        recorded_at: new Date().toISOString(),
        heart_rate_bpm: 75,
        systolic_bp: 120,
        diastolic_bp: 80,
        temperature_celsius: 37.0,
        weight_kg: 80.5,
        clinical_notes: "JOHN DOE was seen today."
    }]
};

async function insert() {
    try {
        console.log("Attempting BigQuery Insert...");
        await bigquery
            .dataset(datasetId)
            .table(tableId)
            .insert([payload]);
        console.log("Success!");
    } catch (e) {
        console.error("PartialFailureError Details:");
        console.error(JSON.stringify(e.errors, null, 2));
    }
}

insert();

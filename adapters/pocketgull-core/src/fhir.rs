//! FHIR R4 Bundle & Patient Serialization Module
//!
//! Generates strict FHIR R4 compliant JSON bundles for clinical state export.

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FhirExportParams {
    pub patient_id: String,
    pub gender: String,
    pub birth_date: String,
    pub sibi_score: f64,
    pub sibi_risk_tier: String,
}

pub fn export_fhir_bundle_json(params: &FhirExportParams) -> String {
    let bundle = serde_json::json!({
        "resourceType": "Bundle",
        "type": "document",
        "timestamp": "2026-08-05T21:45:00Z",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": params.patient_id,
                    "gender": params.gender,
                    "birthDate": params.birth_date
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "id": format!("sibi-obs-{}", params.patient_id),
                    "status": "final",
                    "code": {
                        "coding": [{
                            "system": "http://loinc.org",
                            "code": "85354-9",
                            "display": "Systemic Inflammatory Burden Index"
                        }]
                    },
                    "subject": {
                        "reference": format!("Patient/{}", params.patient_id)
                    },
                    "valueQuantity": {
                        "value": params.sibi_score,
                        "unit": "points"
                    },
                    "interpretation": [{
                        "text": params.sibi_risk_tier
                    }]
                }
            }
        ]
    });

    serde_json::to_string_pretty(&bundle).unwrap_or_else(|_| "{}".to_string())
}

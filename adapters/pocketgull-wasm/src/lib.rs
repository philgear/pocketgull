use wasm_bindgen::prelude::*;
use pocketgull_core::{dsp, sibi::{self, SibiInput}, fhir::{self, FhirExportParams}};

#[wasm_bindgen]
pub fn calculate_sibi_wasm(
    hs_crp: f64,
    hba1c: f64,
    esr: f64,
    ppd: f64,
    twi: u8,
) -> String {
    let input = SibiInput {
        hs_crp_mg_l: hs_crp,
        hba1c_percent: hba1c,
        esr_mm_hr: esr,
        max_ppd_mm: ppd,
        twi_grade: twi,
    };
    let res = sibi::calculate_sibi(&input);
    serde_json::to_string(&res).unwrap_or_else(|_| "{}".to_string())
}

#[wasm_bindgen]
pub fn calculate_hrv_rmssd_wasm(rr_intervals_json: &str) -> f64 {
    let intervals: Vec<f64> = serde_json::from_str(rr_intervals_json).unwrap_or_default();
    dsp::calculate_hrv_rmssd(&intervals)
}

#[wasm_bindgen]
pub fn export_fhir_wasm(
    patient_id: &str,
    gender: &str,
    birth_date: &str,
    sibi_score: f64,
    sibi_risk_tier: &str,
) -> String {
    let params = FhirExportParams {
        patient_id: patient_id.to_string(),
        gender: gender.to_string(),
        birth_date: birth_date.to_string(),
        sibi_score,
        sibi_risk_tier: sibi_risk_tier.to_string(),
    };
    fhir::export_fhir_bundle_json(&params)
}

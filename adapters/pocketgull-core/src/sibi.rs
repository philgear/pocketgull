//! Systemic Inflammatory Burden Index (SIBI) Module
//!
//! Integrates systemic bio-markers (hs-CRP, HbA1c, ESR) with oral cavity status
//! (Periodontal Probing Depth, Tooth Wear Index) to compute a standardized SIBI risk score.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SibiInput {
    pub hs_crp_mg_l: f64,
    pub hba1c_percent: f64,
    pub esr_mm_hr: f64,
    pub max_ppd_mm: f64,
    pub twi_grade: u8, // 0 to 4 (Smith & Knight TWI)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SibiResult {
    pub score: f64,
    pub risk_tier: String,
    pub Systemic_burden_index: f64,
    pub oral_burden_index: f64,
}

/// Calculate Systemic Inflammatory Burden Index (SIBI).
pub fn calculate_sibi(input: &SibiInput) -> SibiResult {
    // Standardized weighting formula
    let crp_norm = (input.hs_crp_mg_l / 10.0).clamp(0.0, 1.0);
    let hba1c_norm = ((input.hba1c_percent - 5.0) / 7.0).clamp(0.0, 1.0);
    let esr_norm = (input.esr_mm_hr / 50.0).clamp(0.0, 1.0);
    let ppd_norm = ((input.max_ppd_mm - 2.0) / 8.0).clamp(0.0, 1.0);
    let twi_norm = (input.twi_grade as f64 / 4.0).clamp(0.0, 1.0);

    let systemic_burden = (crp_norm * 0.45) + (hba1c_norm * 0.35) + (esr_norm * 0.20);
    let oral_burden = (ppd_norm * 0.70) + (twi_norm * 0.30);

    let total_score = ((systemic_burden * 0.65) + (oral_burden * 0.35)) * 100.0;

    let risk_tier = if total_score < 25.0 {
        "LOW_INFLAMMATORY_RISK".to_string()
    } else if total_score < 60.0 {
        "MODERATE_INFLAMMATORY_RISK".to_string()
    } else {
        "HIGH_SYSTEMIC_BURDEN".to_string()
    };

    SibiResult {
        score: (total_score * 100.0).round() / 100.0,
        risk_tier,
        Systemic_burden_index: (systemic_burden * 100.0).round() / 100.0,
        oral_burden_index: (oral_burden * 100.0).round() / 100.0,
    }
}

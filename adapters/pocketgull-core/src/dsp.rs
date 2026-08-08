//! High-Performance Clinical Digital Signal Processing (DSP) Module
//!
//! Provides zero-allocation, deterministic calculations for Heart Rate Variability (HRV)
//! RMSSD (Root Mean Square of Successive Differences) and Respiratory Sinus Arrhythmia (RSA) rate.

/// Calculate Root Mean Square of Successive Differences (RMSSD) from inter-beat intervals (RR in ms).
///
/// # Arguments
/// * `rr_intervals` - Slice of inter-beat intervals in milliseconds.
///
/// # Returns
/// RMSSD in milliseconds, or 0.0 if fewer than 2 intervals are provided.
pub fn calculate_hrv_rmssd(rr_intervals: &[f64]) -> f64 {
    if rr_intervals.len() < 2 {
        return 0.0;
    }

    let mut sum_sq_diff = 0.0;
    let count = rr_intervals.len() - 1;

    for i in 0..count {
        let diff = rr_intervals[i + 1] - rr_intervals[i];
        sum_sq_diff += diff * diff;
    }

    (sum_sq_diff / (count as f64)).sqrt()
}

/// Estimate Respiratory Sinus Arrhythmia (RSA) breathing rate in breaths per minute.
///
/// Analyzes cyclic oscillations in RR interval time-series.
pub fn calculate_rsa_breathing_rate(rr_intervals: &[f64]) -> f64 {
    if rr_intervals.len() < 4 {
        return 12.0; // Default physiological baseline
    }

    let mut zero_crossings = 0;
    let mean: f64 = rr_intervals.iter().sum::<f64>() / (rr_intervals.len() as f64);

    for i in 0..(rr_intervals.len() - 1) {
        let curr = rr_intervals[i] - mean;
        let next = rr_intervals[i + 1] - mean;
        if curr * next < 0.0 {
            zero_crossings += 1;
        }
    }

    let total_time_sec: f64 = rr_intervals.iter().sum::<f64>() / 1000.0;
    if total_time_sec <= 0.0 {
        return 12.0;
    }

    let cycles = (zero_crossings as f64) / 2.0;
    (cycles / total_time_sec) * 60.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rmssd_calculation() {
        let intervals = vec![800.0, 820.0, 790.0, 810.0, 805.0];
        let rmssd = calculate_hrv_rmssd(&intervals);
        assert!(rmssd > 0.0);
    }
}

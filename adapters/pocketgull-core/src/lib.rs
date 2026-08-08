//! Pocketgull Rust Core Engine (`pocketgull-core`)
//!
//! Provides clinical DSP algorithms, SIBI calculation, FHIR R4 serialization,
//! and QR matrix generation.

pub mod dsp;
pub mod fhir;
pub mod sibi;

use qrcode::QrCode;

/// Generate ASCII QR matrix representation of input payload string.
pub fn generate_qr_ascii(data: &str) -> String {
    match QrCode::new(data) {
        Ok(code) => code.render::<char>()
            .quiet_zone(false)
            .module_dimensions(2, 1)
            .build(),
        Err(_) => "ERR_QR_GEN_FAILED".to_string(),
    }
}

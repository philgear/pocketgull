# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/pocketgull/deid"

class DeidTest < Minitest::Test
  def test_text_deidentification
    raw = "Patient John (MRN: 9876543) email test@hospital.org SSN 123-45-6789 phone (555) 019-2834."
    clean = Pocketgull::Deid::SafeHarbor.sanitize_text(raw)

    refute_includes clean, "123-45-6789"
    refute_includes clean, "test@hospital.org"
    refute_includes clean, "9876543"
    assert_includes clean, "[REDACTED-SSN]"
  end

  def test_hash_payload_deidentification
    payload = {
      patient_name: "Jane Doe",
      ssn: "999-88-7777",
      vitals: { hr: 72, temp: 98.6 }
    }
    clean = Pocketgull::Deid::SafeHarbor.sanitize_payload(payload)

    assert_equal "[REDACTED-PHI-FIELD]", clean[:patient_name]
    assert_equal "[REDACTED-PHI-FIELD]", clean[:ssn]
    assert_equal 72, clean[:vitals][:hr]
  end
end

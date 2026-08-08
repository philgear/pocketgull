# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/pocketgull/loinc"

class LoincTest < Minitest::Test
  def test_phq9_evaluation
    answers = [1, 2, 1, 2, 3, 2, 1, 2, 0]
    res = Pocketgull::Loinc::Phq9.evaluate(answers)

    assert_equal "44261-6", res[:loinc_code]
    assert_equal 14, res[:score]
    assert_equal "MODERATE_DEPRESSION", res[:severity]
    refute res[:suicidal_ideation_flag]
  end

  def test_gad7_evaluation
    answers = [3, 3, 2, 3, 2, 3, 2]
    res = Pocketgull::Loinc::Gad7.evaluate(answers)

    assert_equal "69725-0", res[:loinc_code]
    assert_equal 18, res[:score]
    assert_equal "SEVERE_ANXIETY", res[:severity]
  end
end

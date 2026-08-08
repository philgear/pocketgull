# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/pocketgull/cgm"

class CgmTest < Minitest::Test
  def test_agp_analytics
    readings = [85, 110, 140, 175, 95, 65, 190, 125, 105, 115]
    res = Pocketgull::Cgm::AgpCalculator.analyze(readings)

    assert_equal 120.5, res[:mean_glucose_mg_dl]
    assert_equal 80.0, res[:tir_percent]
    assert_equal 10.0, res[:tbr_percent]
    assert_equal 10.0, res[:tar_percent]
    assert res[:gmi_percent] > 5.0
  end
end

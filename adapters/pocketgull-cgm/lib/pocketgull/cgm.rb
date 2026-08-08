# frozen_string_literal: true

module Pocketgull
  module Cgm
    # Ambulatory Glucose Profile (AGP) Analytics Engine
    class AgpCalculator
      TARGET_MIN = 70.0
      TARGET_MAX = 180.0

      def self.analyze(readings_mg_dl)
        return { error: "Insufficient readings" } if readings_mg_dl.nil? || readings_mg_dl.empty?

        total = readings_mg_dl.size.to_f
        mean_glucose = readings_mg_dl.sum / total

        in_range = readings_mg_dl.count { |g| g >= TARGET_MIN && g <= TARGET_MAX }
        below_range = readings_mg_dl.count { |g| g < TARGET_MIN }
        above_range = readings_mg_dl.count { |g| g > TARGET_MAX }

        # Standard deviation & Coefficient of Variation CV%
        variance = readings_mg_dl.sum { |g| (g - mean_glucose)**2 } / total
        std_dev = Math.sqrt(variance)
        cv_percent = (std_dev / mean_glucose) * 100.0

        # GMI (Glucose Management Indicator / Estimated A1c formula)
        # GMI (%) = 3.31 + 0.02392 * [mean glucose in mg/dL]
        gmi = 3.31 + (0.02392 * mean_glucose)

        {
          mean_glucose_mg_dl: mean_glucose.round(1),
          tir_percent: ((in_range / total) * 100.0).round(1),
          tbr_percent: ((below_range / total) * 100.0).round(1),
          tar_percent: ((above_range / total) * 100.0).round(1),
          cv_percent: cv_percent.round(1),
          gmi_percent: gmi.round(2)
        }
      end
    end
  end
end

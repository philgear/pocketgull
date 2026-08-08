# frozen_string_literal: true

module Pocketgull
  module Loinc
    # PHQ-9 Patient Health Questionnaire (Depression Severity)
    # LOINC Code: 44261-6
    class Phq9
      LOINC_CODE = "44261-6"

      def self.evaluate(answers)
        total = answers.compact.sum
        suicidal_flag = (answers[8] || 0) > 0

        severity = if total < 5
                     "MINIMAL_DEPRESSION"
                   elsif total < 10
                     "MILD_DEPRESSION"
                   elsif total < 15
                     "MODERATE_DEPRESSION"
                   elsif total < 20
                     "MODERATELY_SEVERE_DEPRESSION"
                   else
                     "SEVERE_DEPRESSION"
                   end

        {
          loinc_code: LOINC_CODE,
          assessment: "PHQ-9",
          score: total,
          severity: severity,
          suicidal_ideation_flag: suicidal_flag
        }
      end
    end

    # GAD-7 Generalized Anxiety Disorder Questionnaire
    # LOINC Code: 69725-0
    class Gad7
      LOINC_CODE = "69725-0"

      def self.evaluate(answers)
        total = answers.compact.sum

        severity = if total < 5
                     "MINIMAL_ANXIETY"
                   elsif total < 10
                     "MILD_ANXIETY"
                   elsif total < 15
                     "MODERATE_ANXIETY"
                   else
                     "SEVERE_ANXIETY"
                   end

        {
          loinc_code: LOINC_CODE,
          assessment: "GAD-7",
          score: total,
          severity: severity
        }
      end
    end
  end
end

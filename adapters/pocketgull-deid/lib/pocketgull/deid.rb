# frozen_string_literal: true

module Pocketgull
  module Deid
    # HIPAA §164.514 Safe Harbor De-Identification Engine
    class SafeHarbor
      EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
      SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/
      PHONE_REGEX = /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/
      IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/
      MRN_REGEX = /\bMRN[-:]?\s*([A-Z0-9]{6,10})\b/i
      DATE_REGEX = /\b(0[1-9]|1[0-2])[\/.-](0[1-9]|[12]\d|3[01])[\/.-](19|20)\d{2}\b/

      # Sanitize string replacing PHI patterns with HIPAA compliant tokens
      def self.sanitize_text(text)
        return "" if text.nil?

        sanitized = text.dup
        sanitized.gsub!(SSN_REGEX, "[REDACTED-SSN]")
        sanitized.gsub!(EMAIL_REGEX, "[REDACTED-EMAIL]")
        sanitized.gsub!(PHONE_REGEX, "[REDACTED-PHONE]")
        sanitized.gsub!(IP_REGEX, "[REDACTED-IP]")
        sanitized.gsub!(MRN_REGEX, "MRN: [REDACTED-MRN]")
        sanitized.gsub!(DATE_REGEX, "[REDACTED-DATE]")

        sanitized
      end

      # Recursively sanitize payload Hash or Array
      def self.sanitize_payload(payload)
        case payload
        when Hash
          payload.each_with_object({}) do |(k, v), acc|
            key_str = k.to_s.downcase
            acc[k] = if key_str.match?(/(ssn|mrn|email|phone|address|patient_name|dob)/)
                       "[REDACTED-PHI-FIELD]"
                     else
                       sanitize_payload(v)
                     end
          end
        when Array
          payload.map { |elem| sanitize_payload(elem) }
        when String
          sanitize_text(payload)
        else
          payload
        end
      end
    end
  end
end

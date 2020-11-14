# frozen_string_literal: true

require 'serializers/to_csv'

class OpportunitiesCsvSerializer
  include Serializers::ToCsv

  columns :id,
          :created_at,
          :updated_at,
          :pinned,
          :archived,
          :source,
          :role,
          :location,
          :referrer_name,
          :referrer_email,
          :job_title,
          :applied,
          :job_url,
          :applied_on,
          :notes,
          {
            company: :name
          },
          {
            offer: [
              :status,
              :base_salary,
              :total_target_compensation,
              :additional_compensation,
              :expiration_date,
              :created_at,
              :updated_at
            ]
          }
end

# frozen_string_literal: true

require 'serializers/to_csv'

class InteractionsCsvSerializer
  include Serializers::ToCsv

  delegate_accessor :interview, to: :event
  delegate_accessor :company, to: :event_interview

  columns :id,
          :event_id,
          :style,
          :culture_val,
          :one_word,
          :created_at,
          :updated_at,
          {
            event: [
              :style,
              :date,
              :substyle
            ]
          },
          {
            event_interview: :job_title
          },
          {
            event_interview_company: :name
          }
end

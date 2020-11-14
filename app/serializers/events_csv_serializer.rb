# frozen_string_literal: true

require 'serializers/to_csv'

class EventsCsvSerializer
  include Serializers::ToCsv

  delegate_accessor :company, to: :interview

  columns :id,
          :interview_id,
          :style,
          :date,
          :created_at,
          :updated_at,
          :substyle,
          :culture_val,
          :one_word,
          :notes,
          {
            interview: :job_title
          },
          {
            interview_company: :name
          }
end

# frozen_string_literal: true

require 'serializers/to_csv'

class EventsInterviewerRatingsCsvSerializer
  include Serializers::ToCsv

  delegate_accessor :interview, to: :event
  delegate_accessor :company, to: :event_interview

  columns :id,
          :event_id,
          :excited,
          :is_poc,
          :created_at,
          :updated_at,
          {
            interviewer: [
              :name,
              :email,
              :relationship,
              :notes
            ]
          },
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

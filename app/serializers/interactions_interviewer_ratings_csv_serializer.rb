# frozen_string_literal: true

require 'serializers/to_csv'

class InteractionsInterviewerRatingsCsvSerializer
  include Serializers::ToCsv

  delegate_accessor :event, to: :interaction
  delegate_accessor :interview, to: :interaction_event
  delegate_accessor :company, to: :interaction_event_interview

  columns :id,
          :interaction_id,
          :excited,
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
            interaction_event: [
              :style,
              :date,
              :substyle
            ]
          },
          {
            interaction_event_interview: :job_title
          },
          {
            interaction_event_interview_company: :name
          },
          {
            interaction: :style
          }
end

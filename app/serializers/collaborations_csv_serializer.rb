# frozen_string_literal: true

require 'serializers/to_csv'

class CollaborationsCsvSerializer
  include Serializers::ToCsv

  delegate_accessor :company, to: :interview

  columns :id,
          :interview_id,
          :feedback,
          :rating,
          :date_asked,
          :date_completed,
          :created_at,
          :updated_at,
          {
            collaborator: [
              :name,
              :email
            ]
          },
          {
            interview: :job_title
          },
          {
            interview_company: :name
          }
end

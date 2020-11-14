# frozen_string_literal: true

FactoryGirl.define do
  factory :collaboration, class: CollaboratorFeedback do
    interview    # Belongs To Association
    collaborator # Belongs To Association

    feedback       { Faker::Hipster.paragraph(1, false, 3) }        # Text, limit: 65535
    rating         { Faker::Number.between(1, 100) }                # Integer, limit: 4
    token          { Faker::Crypto.sha256 }                         # String, limit 255
    date_asked     { Faker::Date.between(created_at, updated_at) }  # Date
    date_completed { Faker::Date.between(date_asked, updated_at) }  # Date
    created_at     { Faker::Time.between(3.weeks.ago, Date.today) } # Datetime, required
    updated_at     { Faker::Time.between(created_at, Date.today) }  # Datetime, required
  end
end

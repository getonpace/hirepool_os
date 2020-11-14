# frozen_string_literal: true

FactoryGirl.define do
  factory :event do
    # Belongs To Association
    association :interview

    style            { Faker::Hipster.word }                          # String, limit 255
    time_specified   { Faker::Boolean.boolean }                       # Boolean
    created_at       { Faker::Time.between(3.weeks.ago, Date.today) } # Datetime, required
    updated_at       { Faker::Time.between(created_at, Date.today) }  # Datetime, required
    substyle         { Faker::Hipster.word }                          # String, limit 255
    culture_val      { Faker::Number.between(1, 10) }                 # Integer, limit: 4
    one_word         { Faker::Hipster.paragraph(1, true, 3) }         # Text, limit: 65535
    notes            { Faker::Hipster.paragraph(1, true, 3) }         # Text, limit: 65535
    prep_kit_message { Faker::Number.between(1, 10) }                 # Integer, limit: 4

    trait :with_interviewer_feedback do
      # Has Many Through Association
      with_feeback
      association :interviewers
      interviewer_relationship { Faker::TheThickOfIt.position } # String, limit 255
    end

    trait :with_feeback do
      # Has Many Association
      association :events_interviewers, factory: :event_feedback
    end
  end
end

# frozen_string_literal: true

FactoryGirl.define do
  factory :interaction_feedback, class: InteractionsInterviewer do
    relationship { "#{Faker::Job.seniority} #{Faker::Job.position}" } # String, limit: 255
    excited      { Faker::Number.between(1, 10) }                     # Integer, limit: 4
    created_at   { Faker::Time.between(3.weeks.ago, Date.today) }     # Datetime, required
    updated_at   { Faker::Time.between(created_at, Date.today) }      # Datetime, required

    trait :with_interaction do
      # Belongs To Association
      association :interaction
    end

    trait :with_interviewer do
      # Belongs To Association
      association :interviewer
    end
  end
end

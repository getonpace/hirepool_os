# frozen_string_literal: true

FactoryGirl.define do
  factory :company do
    transient do
      # Used to calculate size attribute
      size_magnitude { (10**Faker::Number.between(0, 3)) }
    end

    name       { Faker::Company.name }                          # String, limit 255
    location   { Faker::Address.full_address }                  # String, limit 255
    created_at { Faker::Time.between(1.month.ago, Date.today) } # Datetime, required
    updated_at { Faker::Time.between(created_at, Date.today) }  # Datetime, required
    domain     { Faker::Internet.domain_name }                  # String, limit 255
    size       { Faker::Number.between(1, 9) * size_magnitude } # Integer, limit: 4

    trait :reviewed do
      glassdoor_id                   { Faker::Number.number(10) }      # String, limit: 255
      interview_difficulty           { Faker::Number.between(1, 100) } # Float, limit: 24
      interview_experiences_negative { Faker::Number.between(1, 100) } # Integer, limit: 4
      interview_experiences_neutral  { Faker::Number.between(1, 100) } # Integer, limit: 4
      interview_experiences_positive { Faker::Number.between(1, 100) } # Integer, limit: 4
      interview_process_duration     { Faker::Number.between(1, 100) } # Float, limit: 24
      interview_offers_accepted      { Faker::Number.between(1, 12) }  # Integer, limit: 4
      interview_offers_declined      { Faker::Number.between(1, 12) }  # Integer, limit: 4
      interview_no_offers            { Faker::Number.between(1, 12) }  # Integer, limit: 4
      interview_recent_reviews       { Faker::Number.between(1, 12) }  # Integer, limit: 4

      reviews_last_processed { Faker::Time.between(created_at, updated_at) }  # Datetime
    end
  end
end

# frozen_string_literal: true

FactoryGirl.define do
  factory :interaction do
    style       { Faker::Hipster.word }                          # String, limit 255
    culture_val { Faker::Number.between(1, 10) }                 # Integer, limit: 4
    one_word    { Faker::Hipster.paragraph(1, true, 3) }         # Text, limit: 65535
    created_at  { Faker::Time.between(3.weeks.ago, Date.today) } # Datetime, required
    updated_at  { Faker::Time.between(created_at, Date.today) }  # Datetime, required

    trait :with_event do
      # Belongs To Association
      association :event
    end
  end
end

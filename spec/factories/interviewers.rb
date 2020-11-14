# frozen_string_literal: true

FactoryGirl.define do
  factory :interviewer do
    name         { Faker::Name.name }                             # String, limit 255
    email        { Faker::Internet.safe_email(name) }             # String, limit 255
    role         { Faker::Job.position }                          # String, limit 255
    gender       { Faker::Gender.type }                           # String, limit 255
    created_at   { Faker::Time.between(3.weeks.ago, Date.today) } # Datetime, required
    updated_at   { Faker::Time.between(created_at, Date.today) }  # Datetime, required
    notes        { Faker::Hipster.paragraph(1, true, 3) }         # Text, limit: 65535
    relationship { Faker::TheThickOfIt.position }                 # String, limit 255

    trait :with_user do
      # Belongs To Association
      association :user
    end

    trait :with_company do
      # Belongs To Association
      association :company
    end
  end
end

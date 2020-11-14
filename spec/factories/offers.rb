# frozen_string_literal: true

FactoryGirl.define do
  factory :offer do
    status                    { Faker::Hipster.word }                                        # String, limit 255
    offer_type                { Faker::Hipster.word }                                        # String, limit 255
    expiration_date           { Faker::Time.between(created_at, 1.week.since(created_at)) }  # Datetime, required
    base_salary               { Faker::Number.between(10_000, 1_000_000).round(-3) }         # Decimal, precision: 10, scale: 0
    total_target_compensation { (base_salary * Faker::Number.decimal(1, 3).to_f).round(-3) } # Decimal, precision: 10, scale: 0
    additional_compensation   { Faker::Hipster.sentence(1, true, 5) }                        # String, limit 255
    created_at                { Faker::Time.between(1.weeks.ago, Date.today) }               # Datetime, required
    updated_at                { Faker::Time.between(created_at, Date.today) }                # Datetime, required

    trait :with_interview do
      # Belongs To Association
      association :interview
    end
  end
end

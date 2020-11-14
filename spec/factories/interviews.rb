# frozen_string_literal: true

FactoryGirl.define do
  factory :interview do
    association :user    # Belongs To Association
    association :company # Belongs To Association

    role           { Faker::Job.position }                          # Text, limit 65535
    location       { Faker::Address.full_address }                  # Text, limit 65535
    referrer_name  { Faker::Name.name }                             # Text, limit 65535
    referrer_email { Faker::Internet.safe_email(referrer_name) }    # Text, limit 65535
    created_at     { Faker::Time.between(3.weeks.ago, Date.today) } # Datetime, required
    updated_at     { Faker::Time.between(created_at, Date.today) }  # Datetime, required
    source         { Faker::Internet.url }                          # Text, limit 65535
    pinned         { Faker::Boolean.boolean(0.4) }                  # Boolean
    archived       { Faker::Boolean.boolean(0.25) }                 # Boolean
    job_title      { Faker::Job.title }                             # Text, limit: 65535
    notes          { Faker::Hipster.paragraph(1, true, 3) }         # Text, limit: 65535
    applied        { Faker::Boolean.boolean }                       # Text, limit: 65535
    job_url        { Faker::Internet.url }                          # Text, limit: 65535
    applied_on     { Faker::Date.between(updated_at, Date.today) }  # Date

    trait :with_offers do
      transient do
        offer_count 2
      end

      # Has Many Association, so the foreign key will end up on the associated model instances.
      # Thus, the associated records must be created after saving the interview record.
      after(:create) do |interview, evaluator|
        create_list(:offer, evaluator.offer_count, interview: interview)
      end
    end
  end
end

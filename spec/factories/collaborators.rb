# frozen_string_literal: true

FactoryGirl.define do
  factory :collaborator do
    name  { Faker::Name.name }                 # String, limit 255
    email { Faker::Internet.safe_email(name) } # String, limit 255
  end
end

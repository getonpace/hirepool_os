FactoryGirl.define do
  factory :access_group do
    title { Faker::Company.name }
    key { Faker::Crypto.sha256 }
  end
end

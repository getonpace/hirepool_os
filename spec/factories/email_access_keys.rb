FactoryGirl.define do
  factory :email_access_key do
    email { Faker::Internet.safe_email }
    access_key { Faker::Crypto.sha256 }
  end
end

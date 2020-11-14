FactoryGirl.define do
  factory :user do
    sequence(:name, 1)      { |n| "Jon Doe#{n}" }
    sequence(:email, 1)     { |n| "email#{n}@example.com" }
    sequence(:nickname, 1)  { |n| "jondoe#{n}" }
    password                { "#{Faker::Internet.password(8,20,true,true)}0Aa" }
    password_confirmation   { password }

    trait :random do
      name { Faker::Name.name }
      email { Faker::Internet.safe_email(name) }
      nickname { Faker::Internet.user_name(name) }
    end

    trait :unconfirmed do
      confirmation_token { Devise.friendly_token }
      confirmation_sent_at { Time.zone.now }
    end

    trait :confirmed do
      confirmation_token { Devise.friendly_token }
      confirmation_sent_at { Time.zone.now }
      confirmed_at { Time.zone.now }
    end

    trait :from_email_signup do
      after(:build) do |user|
        user.authentications.build(provider: 'email', email: user.email)
      end
    end

    trait :from_oauth_signup do
      transient do
        provider :facebook
        auth_hash { Faker::Omniauth.send(provider) }
      end

      after(:build) do |user, evaluator|
        evaluator.auth_hash.deep_symbolize_keys.tap do |symbolized_auth_hash|
          auth_hash_info = symbolized_auth_hash.fetch(:info, {})
          user.name = auth_hash_info[:name]
          user.email = auth_hash_info[:email]
        end

        user.authentications << Authentication.build_from_auth(evaluator.auth_hash)
      end
    end
  end
end

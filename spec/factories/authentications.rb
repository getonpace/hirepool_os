FactoryGirl.define do
  factory :authentication do
    user
    provider 'email'
    email { Faker::Internet.safe_email }
    uid { email }

    trait :from_oauth do
      transient do
        auth_provider :facebook
        auth_hash { Faker::Omniauth.send(auth_provider) }
      end

      provider { auth_hash[:provider] }
      uid { auth_hash[:uid] }
      name { auth_hash[:info][:name] }
      email { auth_hash[:info][:email] }

      token { auth_hash[:credentials][:token] }

      params { auth_hash }
    end
  end
end

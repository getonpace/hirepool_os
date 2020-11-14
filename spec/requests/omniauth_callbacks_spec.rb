require 'rails_helper'

def oauth_callback_action(action_name)
  { controller: :omniauth_callbacks, action: action_name }
end

RSpec.describe 'Omniauth Callbacks', type: :request do
  let(:provider) { :facebook }
  let(:redirect_url) { 'http://www.example.com' }
  let(:request_path) { "/api/auth/#{provider.to_s}" }

  let(:oauth_params) do
    {
      auth_origin_url: redirect_url,
      omniauth_window_type: 'newWindow'
    }
  end

  let!(:provider_response) do
    Faker::Omniauth.send(provider).tap do |response|
      OmniAuth.config.mock_auth[provider] = response
    end
  end

  subject(:register_oauth) do
    silence_omniauth do
      get request_path, oauth_params
      follow_all_redirects!
    end
  end

  it 'responds with successful' do
    register_oauth
    expect(response).to be_success
  end

  # TODO: probably remove this test... the sequence *should* be tested already
  #       by Devise, DeviseTokenAuth, and/or Omniauth.
  it 'redirects to the correct callback sequence' do
    silence_omniauth do
      get request_path, oauth_params

      follow_redirect!
      expect(response).to redirect_to "#{redirect_url}/api/#{provider}/callback"

      follow_redirect!
      expect(response).to redirect_to(action: :omniauth_success)
    end
  end

  it 'creates the user' do
    expect { register_oauth }.to change { User.count }.by(1)
  end

  it 'creates the authentication for the user' do
    expect { register_oauth }.to change { Authentication.count }.by(1)
  end

  it 'clears session vars' do
    register_oauth

    expect(request.session['dta.omniauth.auth']).not_to be_truthy
    expect(request.session['dta.omniauth.params']).not_to be_truthy
  end

  it 'should redirect via a valid url' do
    register_oauth
    expect(request.original_url).to eq("#{redirect_url}#{request_path}/callback")
  end

  describe 'oauth registration' do
    context 'with a new user' do
      it 'contains oauth_registration attr in the response' do
        register_oauth
        expect(controller.auth_params).to include(oauth_registration: true)
      end
    end

    context 'with an existing user via email authentication' do
      let(:existing_email) { 'user23@example.abcde' }

      let!(:existing_user) do
        FactoryGirl.create(:user, :from_email_signup, email: existing_email)
        # FactoryGirl.create(:user, :confirmed, :from_email_signup, email: existing_email)
      end

      let!(:provider_response) do
        Faker::Omniauth.facebook.with_indifferent_access.tap do |auth_hash|
          auth_hash[:info][:email] = existing_email
          OmniAuth.config.mock_auth[:facebook] = auth_hash
        end
      end

      it 'does not contain oauth_registration flag in the response' do
        register_oauth
        expect(controller.auth_params).not_to include(:oauth_registration)
      end

      it 'does not create a new User record' do
        expect { register_oauth }.not_to change { User.count }
      end

      it 'creates a new Authentication associated with the existing user' do
        expect { register_oauth }.to change {
          existing_user.reload.authentications.size
        }.by(1)
      end
    end

    context 'with an existing user via another oauth authentication' do
      let!(:existing_oauth) do
        Faker::Omniauth.google.with_indifferent_access.tap do |auth_hash|
          auth_hash[:info][:email] = provider_response[:info][:email]
          OmniAuth.config.mock_auth[:google_oauth2] = auth_hash
        end
      end

      let!(:existing_user) do
        FactoryGirl.create :user, :from_oauth_signup, {
          provider: 'google_oauth2',
          auth_hash: existing_oauth
        }
      end

      it 'does not contain oauth_registration flag in the response' do
        register_oauth
        expect(controller.auth_params).not_to include(:oauth_registration)
      end

      it 'does not create a new User record' do
        expect { register_oauth }.not_to change { User.count }
      end

      it 'creates a new Authentication associated with the existing user' do
        expect { register_oauth }.to change {
          existing_user.reload.authentications.size
        }.by(1)
      end
    end

    context 'with an existing user via the same oauth authentication' do
      let!(:existing_user) do
        FactoryGirl.create(:user, :from_oauth_signup, auth_hash: provider_response)
      end

      it 'does not contain oauth_registration flag in the response' do
        register_oauth
        expect(controller.auth_params.key?(:oauth_registration)).to be(false)
      end

      it 'does not create a new User record' do
        expect { register_oauth }.not_to change { User.count }
      end

      it 'does not create a new Authentication for the existing user' do
        expect { register_oauth }.not_to change {
          existing_user.reload.authentications
        }
      end
    end
  end
end
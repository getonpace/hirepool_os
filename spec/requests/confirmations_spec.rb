require 'rails_helper'

RSpec.describe 'Email confirmation via a link', type: :request do
  let(:client_config) { 'default' }
  let(:redirect_url) { 'http://localhost:9000/#/welcome' }

  context 'when a user has an unconfirmed email' do
    let(:user) { FactoryGirl.create(:user, :from_email_signup) }
    let(:valid_confirmation_params) do
      {
        confirmation_token: user.confirmation_token,
        config: client_config,
        redirect_url: redirect_url.to_param
      }
    end

    subject(:email_confirmation_request) do
      get user_confirmation_path(user, valid_confirmation_params)
    end

    it 'confirms the user' do
      expect { email_confirmation_request }.to change { user.reload.confirmed? }.from(false).to(true)
    end

    it 'enqueues the welcome email for later delivery' do
      ActiveJob::Base.queue_adapter = :test
      expect { email_confirmation_request }.to have_enqueued_job.on_queue('mailers')
    end

    it 'redirects to the correct url' do
      redirect_url_with_query = /^#{redirect_url.gsub(%r{\/#\/}, '/(?:.*)#/')}/
      email_confirmation_request
      expect(response).to redirect_to redirect_url_with_query
    end
  end

  context 'when a user has already confirmed their email' do
    let(:confirmed_user) { FactoryGirl.create(:user, :confirmed, :from_email_signup) }
    let(:reused_confirmation_params) do
      {
        confirmation_token: confirmed_user.confirmation_token,
        config: client_config,
        redirect_url: redirect_url.to_param
      }
    end

    subject(:email_confirmation_request) do
      get user_confirmation_path(confirmed_user, reused_confirmation_params)
    end

    it 'does not re-confirm the user' do
      expect(confirmed_user).to be_confirmed
      expect { email_confirmation_request }.to_not change { confirmed_user.reload.confirmed_at }
    end

    it 'does not enqueue a welcome email' do
      ActiveJob::Base.queue_adapter = :test
      expect { email_confirmation_request }.not_to have_enqueued_job.on_queue('mailers')
    end

    it 'redirects to the sign_in page' do
      email_confirmation_request
      # TODO: is this correct?
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  context 'when a user has an expired email confirmation token' do
    before(:all) { Devise.confirm_within = 3.days }
    after(:all) { Devise.confirm_within = nil }

    let!(:unconfirmed_user) do
      FactoryGirl.create(:user, :unconfirmed, :from_email_signup) do |u|
        u.update!(confirmation_sent_at: (3.days.ago - 1))
      end
    end

    let(:expired_confirmation_params) do
      {
        confirmation_token: unconfirmed_user.confirmation_token,
        config: client_config,
        redirect_url: redirect_url.to_param
      }
    end

    subject(:email_confirmation_request) do
      get user_confirmation_path(unconfirmed_user, expired_confirmation_params)
    end

    it 'does not confirm the user' do
      expect(unconfirmed_user.confirmed_at).to be_nil
      expect { email_confirmation_request }.to_not change { unconfirmed_user.reload.confirmed_at }
    end

    it 'does not enqueue the welcome email' do
      ActiveJob::Base.queue_adapter = :test
      expect { email_confirmation_request }.not_to have_enqueued_job.on_queue('mailers')
    end

    it 'responds with 422 "Unprocessable Entity"' do
      email_confirmation_request
      # TODO: is this correct?
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
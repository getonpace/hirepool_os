require 'test_helper'

#  was the web request successful?
#  was the user redirected to the right page?
#  was the user successfully authenticated?
#  was the correct object stored in the response?
#  was the appropriate message delivered in the json payload?

class DeviseTokenAuth::ConfirmationsControllerTest < ActionController::TestCase
  extend Minitest::Spec::DSL

  describe DeviseTokenAuth::ConfirmationsController do
    describe '#show' do
      let(:success_url) { Faker::Internet.url }
      let(:user) { users(:unconfirmed_email_user) }

      let(:valid_params) do
        {
          config: 'default',
          confirmation_token: user.confirmation_token,
          redirect_url: success_url
        }
      end

      describe 'success' do
        subject { get :show, params: valid_params, xhr: true }

        it 'should confirm the user with the given token' do
          assert_changes -> { user.confirmed_at }, from: nil do
            subject
            user.reload
          end
        end

        it 'should create a new auth_token for the user with the given token' do
          assert_changes -> { user.tokens } do
            subject
            user.reload
          end
        end

        it 'should sign the user in' do
          subject
          assert warden.authenticated?(:user)
        end

        it 'should redirect to success url' do
          subject
          assert_redirected_to(/^#{success_url}/)
        end

        describe 'within an explicit confirmation period' do
          let(:user) { users(:recent_unconfirmed_email_user) } # confirmation_sent_at => 1.day.ago

          before { Devise.confirm_within = 1.week } # 1.week.from(1.day.ago) > now
          after { Devise.confirm_within = nil } # nil = unlimited

          it 'should confirm the user with the given token' do
            assert_changes -> { user.confirmed_at }, from: nil do
              subject
              user.reload
            end
          end

          it 'should create a new auth_token for the user with the given token' do
            assert_changes -> { user.tokens } do
              subject
              user.reload
            end
          end

          it 'should sign the user in' do
            subject
            assert warden.authenticated?(:user)
          end

          it 'should redirect to success url' do
            subject
            assert_redirected_to(/^#{success_url}/)
          end
        end
      end

      describe 'failure' do
        describe 'for an already confirmed user resource' do
          let(:user) { users(:confirmed_email_user) }

          subject { get :show, params: valid_params, xhr: true }

          it 'should not update the user' do
            assert_no_changes -> { user } do
              subject
              user.reload
            end
          end

          it 'should respond with 422 "Unprocessable Entity"' do
            subject
            assert_response :unprocessable_entity
          end

          it 'should have "success: false" in the json response' do
            subject
            assert_equal false, json_response['success']
          end

          it 'should include error "email already confirmed" in the json response' do
            subject
            assert_includes json_response['errors']['email'], 'was already confirmed, please try signing in'
          end
        end

        describe 'for a not-found user' do
          let(:missing_token_params) do
            valid_params.merge(confirmation_token: 'missing_token')
          end

          subject { get :show, params: missing_token_params, xhr: true }

          it 'should respond with 422 "Unprocessable Entity"' do
            subject
            assert_response :unprocessable_entity
          end

          it 'should have "success: false" in the json response' do
            subject
            assert_equal false, json_response['success']
          end

          it 'should include error "confirmation token is invalid" in the json response' do
            subject
            assert_includes json_response['errors']['confirmation_token'], 'is invalid'
          end
        end

        describe 'for an expired confirmation period' do
          let(:confirmation_period_expired_message) do
            "needs to be confirmed within %{period}, please request a new one" \
              % {period: Devise::TimeInflector.time_ago_in_words(1.week.ago)}
          end

          # user.confirmation_sent_at = 2.weeks.ago (see :unconfirmed_email_user fixture).
          before { Devise.confirm_within = 1.week } # 1.week.from(2.weeks.ago) < now
          after { Devise.confirm_within = nil } # nil = unlimited

          subject { get :show, params: valid_params, xhr: true }

          it 'should respond with 422 "Unprocessable Entity"' do
            subject
            assert_response :unprocessable_entity
          end

          it 'should have "success: false" in the json response' do
            subject
            assert_equal false, json_response['success']
          end

          it 'should include error "needs to be confirmed within..." in the json response' do
            subject
            assert_includes json_response['errors']['email'], confirmation_period_expired_message
          end
        end
      end

      # test with non-standard user class
      describe 'Alternate user model' do
        before { @request.env['devise.mapping'] = Devise.mappings[:mang] }
        after  { @request.env['devise.mapping'] = Devise.mappings[:user] }

        let(:configName) { 'altUser' }
        let(:manager) { mangs(:unconfirmed_email_user) }

        let(:valid_alt_params) do
          valid_params.merge(
            config: configName,
            confirmation_token: manager.confirmation_token
          )
        end

        subject { get :show, params: valid_alt_params, xhr: true }

        it 'should confirm the manager with the given token' do
          assert_changes -> { manager.confirmed_at }, from: nil do
            subject
            manager.reload
          end
        end

        it 'should create a new auth_token for the manager with the given token' do
          assert_changes -> { manager.tokens } do
            subject
            manager.reload
          end
        end

        it 'should sign the manger in' do
          subject
          assert warden.authenticated?(:mang)
        end

        it 'should redirect to success url' do
          subject
          assert_redirected_to(/^#{success_url}/)
        end
      end
    end
  end
end

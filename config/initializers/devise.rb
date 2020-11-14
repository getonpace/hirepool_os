require 'devise/models/confirmable_overrides'
Devise.setup do |config|
  # The e-mail address that mail will appear to be sent from
  # If absent, mail is sent from "please-change-me-at-config-initializers-devise@example.com"
  config.mailer_sender = "support@hirepool.io"

  config.password_length = 8..128

  # Need 1 char of A-Z, a-z and 0-9
  config.password_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/

  # Deny old password (true, false, count)
  config.deny_old_passwords = false

  # Devise :confirmable config
  #config.allow_unconfirmed_access_for = 365.days
  config.reconfirmable = false

  # Configure Omniauth providers
  config.omniauth :google_oauth2,
    Rails.application.secrets.google_client_id,
    Rails.application.secrets.google_client_secret,
    display: 'popup',
    scope: 'email, profile'

  config.omniauth :github,
    Rails.application.secrets.github_key,
    Rails.application.secrets.github_secret,
    display: 'popup',
    scope: 'user:email,profile'

  config.omniauth :linkedin,
    Rails.application.secrets.linkedin_client_id,
    Rails.application.secrets.linkedin_client_secret,
    display: 'popup',
    scope: 'r_basicprofile r_emailaddress',
    fields: [
      'id', 'email-address', 'first-name', 'last-name',
      'headline', 'industry', 'picture-url', 'public-profile-url'
    ]

  config.omniauth :twitter,
    Rails.application.secrets.twitter_api_key,
    Rails.application.secrets.twitter_api_secret,
    display: 'popup',
    scope: 'email'

  config.omniauth :facebook,
    Rails.application.secrets.facebook_app_id,
    Rails.application.secrets.facebook_app_secret,
    display: 'popup',
    scope: 'email,publish_actions',
    info_fields: 'email,name',
    setup: -> (env) {
      request = Rack::Request.new(env)

      # If additional OAuth permissions are set in the session, then append them to the scope.
      if request.session[:fb_permissions].present?
        request.env['omniauth.strategy'].options[:scope] += ",#{request.session[:fb_permissions]}"
      end
    }

  config.confirm_within = 7.days
end

# Hack to remove the default :after_set_user hook from Devise::Activatable
#   and provide a custom hook that
require 'devise/hooks/conditional_activatable'


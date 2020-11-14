# # config/initializers/omniauth.rb
# Rails.application.config.middleware.use OmniAuth::Builder do
#   provider :google_oauth2,
#     Rails.application.secrets.google_client_id,
#     Rails.application.secrets.google_client_secret

#   provider :github,
#     Rails.application.secrets.github_key,
#     Rails.application.secrets.github_secret,
#     scope: 'user:email,profile'

#   provider :linkedin,
#     Rails.application.secrets.linkedin_client_id,
#     Rails.application.secrets.linkedin_client_secret,
#     scope: 'r_basicprofile r_emailaddress',
#     fields: ["id", "email-address", "first-name", "last-name", "headline", "industry", "picture-url", "public-profile-url"]

#   provider :twitter,
#     Rails.application.secrets.twitter_api_key,
#     Rails.application.secrets.twitter_api_secret

#   provider :facebook,
#     Rails.application.secrets.facebook_app_id,
#     Rails.application.secrets.facebook_app_secret,
#     display: 'popup',
#     setup: -> (env) {
#       request = Rack::Request.new(env)
#       request.env['omniauth.strategy'].options[:scope] = request.session[:fb_permissions]
#     }
# end

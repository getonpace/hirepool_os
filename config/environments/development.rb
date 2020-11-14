Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_deliveries = true

  # Rails.application.routes.default_url_options[:host] = 'localhost:3000'

  # http://stackoverflow.com/questions/18124878/netsmtpauthenticationerror-when-sending-email-from-rails-app-on-staging-envir
  # config.action_mailer.smtp_settings = { :address => 'localhost', :port => 1025 }

  config.action_mailer.default_url_options = { host: 'localhost', port: '9000' }
  config.action_mailer.default_options = { charset: 'utf-8' }
  config.action_mailer.delivery_method = :letter_opener

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Asset digests allow you to set far-future HTTP expiration dates on all assets,
  # yet still be able to expire them through the digest params.
  config.assets.digest = true

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Defines which dynamodb table to use for saving company information
  config.x.dynamodb.companies_table = 'companies-dev'

  # Defines which dynamodb table to use for saving company_glassdoor ratings information
  config.x.dynamodb.company_glassdoor_table = 'company-ratings-dev'

  # Defines which dynamodb table to use for saving User Surveys
  config.x.dynamodb.user_surveys_table = 'user-surveys-dev-encrypted'

  # Defines which dynamodb table to use for saving Premium Surveys
  config.x.dynamodb.premium_surveys_table = 'premium-surveys-dev-encrypted'

  # Defines which dynamodb table to use for saving FAQ questions
  config.x.dynamodb.faq_questions_table = 'faq-questions-dev'

  # Defines which lambda function to trigger for fetching interview reviews from glassdoor
  config.x.lambda.interview_reviews_job = 'null'

  # Defines web app URL used by DeviseTokenAuth initializer / config
  config.web_app_base_url = 'http://localhost:9000/#'
end

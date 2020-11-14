source 'https://rubygems.org'

# Workaround for bundler < 2.0...
# See https://github.com/bundler/bundler/pull/2569 for discussion
# git_source(:github) do |repo_name|
#   repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
#   "https://github.com/#{repo_name}.git"
# end

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.5'
# Use mysql as the database for Active Record
gem 'mysql2', '>= 0.3.13', '< 0.5'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.1.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

gem 'devise', '~> 3.5.10'
# gem 'devise_token_auth', '0.1.42'
# gem 'devise_token_auth', github: 'lynndylanhurley/devise_token_auth', \
#                          branch: 'multi_auth_methods_per_resource'
# gem 'devise_token_auth', github: 'hirepool/devise_token_auth', branch: 'prod'
gem 'devise_token_auth', path: 'vendor/gems/devise_token_auth'
gem 'devise_security_extension'
# must use version 1.3.1 see github issue below
# https://github.com/decioferreira/omniauth-linkedin-oauth2/issues/28
gem 'omniauth-oauth2', '1.3.1'
# Used for OAuth
gem 'omniauth-facebook'
gem 'omniauth-github'
gem 'omniauth-google-oauth2'
gem 'omniauth-linkedin-oauth2'
gem 'omniauth-twitter'
# end Used for OAuth

gem 'aws-sdk', '~> 2'
gem 'fog-aws', '~> 3.3'
gem 'carrierwave', '~> 1.0'

gem 'http'
gem 'google-drive'
gem 'puma'
gem 'clearbit'

gem 'stripe'

gem 'intercom', '~> 3.5.25'

gem 'sucker_punch', '~> 1.6'

# TODO: find out why eb is not running our rake tasks on deploy without factory_girls
# When factory girl is not available in the production group, elastic beanstalk fails to run migrations.
# Elastic Beanstalk logs:
#
# su -s /bin/bash -c 'bundle exec /opt/elasticbeanstalk/support/scripts/check-for-rake-task.rb db:migrate' webapp
# rake aborted!
#
# Could not load 'factory_girl' gem. Please check your Gemfile and environment
# to make sure it is available, and try running this rake task again.
#
# The following environment variables may need adjusting:
# 	RACK_ENV
# 	RAILS_ENV
# 	BUNDLE_WITHOUT
#
# No db:migrate task in Rakefile, skipping database migration.
gem 'factory_girl_rails', '~> 4.8.0'

# Monitoring
group :staging, :production do
  gem 'ddtrace'
end

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  gem 'better_errors'
  gem 'binding_of_caller', require: false

  # gem 'foreman'

  # gem 'guard-bundler'
  # gem 'guard-rspec'

  gem 'spring-commands-rspec'

  gem 'letter_opener', '~> 1.0'
  gem 'letter_opener_web', '~> 1.0'
end

group :development, :test do
  gem 'rubocop', require: false
  # gem 'rubocop-thread_safety'
  # gem 'rubocop-rspec'
  gem 'scss-lint'

  # gem 'dotenv-rails'

  gem 'pry-rails'
  gem 'pry-rescue'
  gem 'pry-byebug'
  gem 'wirble', require: false
  gem 'hirb', require: false
  gem 'awesome_print', require: false

  gem 'rspec-rails', '~> 3.7.0'
  # gem 'factory_girl_rails', '~> 4.8.0'
  # gem 'mocha'
  gem 'webmock'
  gem 'json_spec'
  gem 'timecop'
  gem 'launchy'
  gem 'faker'
  gem 'dotenv-rails'
end

group :test do
  gem 'database_cleaner'
end

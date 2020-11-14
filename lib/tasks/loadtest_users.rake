require 'csv'

begin
  require 'factory_girl'
rescue LoadError => e
  raise unless e.message =~ /factory_girl/
  abort <<-MSG
  rake aborted!

  Could not load 'factory_girl' gem.  Please check your Gemfile and environment
  to make sure it is available, and try running this rake task again.

  The following environment variables may need adjusting:
    RACK_ENV
    RAILS_ENV
    BUNDLE_WITHOUT

  MSG
end

# Class to encapsulate the generation and parsing of CSV
class LoadtestUsers
  class CsvFileMissing < StandardError; end # :nodoc:

  ANSIColor = {green: "\e[32m", red: "\e[31m", reset: "\e[0m"}.freeze

  include Rake::DSL

  def initialize
    namespace :loadtest_users do

      desc 'Generate a list of attributes for fake users'
      task generate_attributes: :environment do
        users_attrs = generate_attributes_list
        puts users_attrs.inspect
      end

      desc 'Generate a CSV file with attributes for fake users'
      task generate_csv: :environment do
        users_attrs = generate_attributes_list
        generate_csv(users_attrs)
        f_puts "Generated '#{csv_file}' containing attributes for #{users_attrs.count} users", color: :green
      end

      desc 'Create User records from the attributes in a CSV file'
      task create_from_csv: :environment do
        users = create_from_csv
        if users.any?
          f_puts "Created #{users.count} Users with the attributes from '#{csv_file}'", color: :green
        else
          f_puts "No users created. Check the contents of '#{csv_file}'", color: :red
        end
      end

      desc 'Display help and usage instructions'
      task help: :environment do
        abort rake_usage
      end
    end
  end

  protected

    def generate_attributes_list
      FactoryGirl.attributes_for_list(:user, user_count, :random) do |u|
        u[:email]    = "#{user_prefix}#{u[:email]}"
        u[:nickname] = "#{user_prefix}#{u[:nickname]}"
        u.delete(:password_confirmation)
      end
    end

    def generate_csv(users_attrs)
      CSV.open(csv_file, 'wb') do |csv|
        csv << users_attrs.map(&:keys).reduce(:|)  # use keys to set headers on the first line
        users_attrs.map(&:values).reduce(csv, :<<) # add the values on each successive line
      end
    end

    def create_from_csv
      rows = CSV.read(csv_file, headers: true)
      rows.map(&:to_hash).map(&:symbolize_keys).map do |params|
        FactoryGirl.create(:user, :confirmed, :from_email_signup, params) do |u|
          u.touch(*timestamp_attrs)
        end
      end
    end

  private

    def user_count
      @user_count ||= ::ENV.fetch('USER_COUNT', 1).to_i
    end

    def user_prefix
      @user_prefix ||= ::ENV.fetch('USER_PREFIX', '')
    end

    def csv_file
      @csv_file ||= ::ENV.fetch('CSV_FILE', "loadtest_#{user_count}_users.csv")
    end

    def timestamp_attrs
      [
        :saw_user_agreement_at,
        :welcome_email_sent_at,
        :last_sign_in_at,
      ]
    end

    def rake_usage
      <<-MSG
  \nUSAGE:

    Create User records from the attributes in a CSV file:
      rake loadtest_users:create_from_csv [CSV_FILE='loadtest_users.csv']

    Generate a CSV file with attributes for fake users:
      rake loadtest_users:generate_csv [USER_COUNT=1] [USER_PREFIX=''] [CSV_FILE='loadtest_users.csv']

    Generate a list of attributes for fake users:
      rake loadtest_users:generate_attributes [USER_COUNT=1] [USER_PREFIX='']

    Display help and usage instructions:
      rake loadtest_users:help

  \nTIP:

    The following environment variables may need adjusting to ensure the
    correct application environment, database, and gem availability:
      RACK_ENV
      RAILS_ENV
      BUNDLE_WITHOUT
MSG
    end

    def f_puts(msg, prefix: '>>>  ', color: nil)
      puts "#{prefix}#{ANSIColor[color]}#{msg}#{ANSIColor[:reset] unless color.nil?}"
    end
end

LoadtestUsers.new

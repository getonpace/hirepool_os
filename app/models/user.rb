require 'aws/sqs/hirepool_interface'

class User < ActiveRecord::Base
  CURRENT_INTERCOM_MESSAGING_VERSION = "4.0"
  STRIPE_PUBLIC_KEY = ENV['STRIPE_PUBLIC_KEY']

  # Include default devise modules.
  devise :database_authenticatable, :registerable, :confirmable,
          :recoverable, :rememberable, :trackable, :secure_validatable,
          :omniauthable, omniauth_providers: Authentication::PROVIDERS

  include DeviseTokenAuth::Concerns::User

  belongs_to :access_group
  has_many :payments
  has_many :user_actions
  has_many :surveys
  has_many :interviews
  has_many :interviewers
  has_many :users_user_tracking_tags
  has_many :user_tracking_tags, through: :users_user_tracking_tags
  has_many :events, through: :interviews
  has_many :offers, through: :interviews
  has_many :resumes
  has_many :subscription_activities
  has_many :subscriptions
  has_many :invoices, through: :subscriptions

  has_many :authentications, inverse_of: :user, dependent: :destroy,
    after_add: :update_timestamps_when_authentication_merged

  validates_uniqueness_of :email

  before_create :set_intercom_messaging_version
  after_create :set_payments_group

  def as_json(options={})
    super.tap do |json|
      json.merge!(base_json_response)
      json.merge!(authentications_json_response)
      json.merge!(admin_json_response) if options[:admin_data]
    end
  end

  scope :excluding_boolean, ->(col) { where(col => [nil, false]) }
  scope :excluding_booleans, ->(cols) do
    cols.map { |c| excluding_boolean(c) }.reduce(&:merge)
  end

  scope :with_accepted_agreement, -> do
    where(user_agreement_status: ['accepted', 'auto-accepted'])
  end

  scope :for_authentication_of, ->(provider_attrs) do
    includes(:authentications)\
      .joins(:authentications)\
      .where(authentications: provider_attrs)
  end

  # Meta-program to keep DRY
  #
  # EXAMPLES:
  #   resource_finder_for :email, ->(email) {
  #     for_authentication_of(provider: 'email', uid: email)
  #   }
  #
  #   resource_finder_for :facebook, ->(facebook_id) {
  #     for_authentication_of(provider: 'facebook', uid: facebook_id)
  #   }
  #
  Authentication::PROVIDERS \
    .each do |provider_name|
      class_eval do
        resource_finder_for provider_name, ->(provider_id) {
          for_authentication_of(provider: provider_name, uid: provider_id).first
        }
      end
    end

  def authentication_providers
    authentications.pluck(:provider)
  end

  def create_intercom_user
    AWS::SQS::HirepoolInterface.new.create_intercom_user(self)
  end

  def update_intercom_user_payments
    AWS::SQS::HirepoolInterface.new.update_intercom_user_payments(self)
  end

  def intercom_user_created?
    intercom_user_created_at?
  end

  def update_intercom_cerebro_data
    AWS::SQS::HirepoolInterface.new.update_cerebro_data(self)
  end

  def send_already_confirmed_email(url)
    UserAlreadyConfirmedMailer.already_confirmed_email(self, url).deliver_later
  end

  def update_timestamps_when_authentication_merged(authentication)
    # TODO: Investigate `authentications.many?` vs. `authentications.all.many?`
    #
    #   Perhaps this is related to the lazy evaluation of AR::Relation objects.
    #
    #   In Rails 4.2.5, the former calls `SELECT COUNT(*) ...` and erroneously
    #   returns `true`, while the latter calls `SELECT authentications.* ...`
    #   and correctly returns `false`.  Curiously, a call to `authentications`
    #   _before_ a call to `authentications.many?` leads to a correct response
    #   of `true`.
    #
    #   For Rails 4.2.5, the call to `authentications.many?` depends on `#size`.
    #   See: `active_record/associations/collection_association.rb`, line 292

    # Update the :last_authentication_merged_at timestamp and set the
    #   :last_authentication_merged_provider if a new provider was merged
    #   into a resource with an existing provider.
    if authentications.all.many?
    #if authentications.many?
      touch(:last_authentication_merged_at)
      self[:last_authentication_merged_provider] = authentication[:provider]
      self.save!
    end
  end

  def days_active
    @days_active ||= user_actions.group('DATE(created_at)').length
  end

  def set_payments_group
    if ['premium-free'].include? self[:sponsor]
      self.payments_group = '1.0.1' # charge $0 -- cerebro is free
    elsif ['premium-five'].include? self[:sponsor]
      self.payments_group = '1.0.2' # charge $4.99/mo for cerebro
    elsif self[:sponsor] == 'premium-twenty'
      self.payments_group = '1.0.3' # charge $19.99/mo for cerebro
    elsif self.id.to_i % 3 == 1
      self.payments_group = '1.0.1' # charge $0 -- cerebro is free
    elsif self.id.to_i % 3 == 2
      self.payments_group = '1.0.2' # charge $4.99/mo for cerebro
    else
      self.payments_group = '1.0.3' # charge $19.99/mo for cerebro
    end
    self.save
  end

  def get_amount
    amount = 0
    if self[:payments_group] == "1.0.2"
      amount = 499
    elsif self[:payments_group] == "1.0.3"
      amount = 1999
    elsif self[:payments_group] == "1.0.ashwini"
      amount = 5000
    end
    amount
  end

  def get_payment_period
    period = nil
    if self[:payments_group] == "1.0.2" || self[:payments_group] == "1.0.3"
      period = 'month'
    elsif self[:payments_group] == "1.0.ashwini"
      period = 'year'
    end
    period
  end

  def payments_last_paid_at
    self.payments.all.where(status: 'succeeded').order(completed_at: :desc).try(:first).try(:completed_at)
  end

  def payments_last_paid_amount
    self.payments.all.where(status: 'succeeded').order(completed_at: :desc).try(:first).try(:amount)
  end

  def payments_subscription_renewal_date
    renewal_date = nil
    last_payment = self.payments.all.where(status: 'succeeded').order(completed_at: :desc).first
    period = get_payment_period
    if last_payment && last_payment[:completed_at]
      if period == 'month'
        renewal_date = last_payment[:completed_at].to_date + 1.months
      elsif period == 'year'
        renewal_date = last_payment[:completed_at].to_date + 12.months
      end
    end
    renewal_date
  end

  def payments_total_paid_amount
    self.payments.all.where(status: 'succeeded').sum(:amount)
  end

  def payments_total_payments_made
    self.payments.all.where(status: 'succeeded').count(:all)
  end

  private

    delegate :count, to: :interviews, prefix: :opportunities
    delegate :count, to: :events, prefix: true
    delegate :count, to: :user_actions, prefix: true
    delegate :count, to: :offers, prefix: true
    delegate :interviews_count, to: :events, prefix: true
    delegate :in_person_interviews_count, to: :events, prefix: true

    def base_json_response
      {
        user_tracking_tags:   user_tracking_tags.as_json,
        access_group:         access_group,
        days_active:          days_active,
        user_actions_count:   user_actions_count,
        opportunities_count:  opportunities_count,
        events_count:         events_count,
        events_interviews_count: events_interviews_count,
        events_in_person_interviews_count: events_in_person_interviews_count,
        offers_count:         offers_count,
        created_at:           created_at,
        confirmed_at:         confirmed_at,
        payment_amount:       get_amount,
        payment_period:       get_payment_period,
        stripe_key:           STRIPE_PUBLIC_KEY
      }
    end

    def authentications_json_response
      {
        available_authentication_providers: authentication_providers
      }
    end

    def admin_json_response
      {
        access_group_title: access_group.try(:title),
        payments_last_paid_at: payments_last_paid_at,
        payments_last_paid_amount: payments_last_paid_amount,
        payments_subscription_renewal_date: payments_subscription_renewal_date,
        payments_total_paid_amount: payments_total_paid_amount,
        payments_total_payments_made: payments_total_payments_made,
        created_at_date: created_at.to_date,
        updated_at_date: updated_at.to_date
      }
    end

    def set_intercom_messaging_version
      self.intercom_messaging_version = CURRENT_INTERCOM_MESSAGING_VERSION
    end
end

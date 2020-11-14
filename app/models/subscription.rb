class Subscription < ActiveRecord::Base
  belongs_to :user
  has_many :invoices

  validates_presence_of :stripe_subscription_id
end
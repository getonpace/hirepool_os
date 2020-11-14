class Invoice < ActiveRecord::Base
  belongs_to :subscription

  validates_presence_of :stripe_invoice_id
  validates_presence_of :stripe_status
end
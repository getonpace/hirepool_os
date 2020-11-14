class RemoveStripeSubscriptionIdFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :stripe_subscription_id
  end
end

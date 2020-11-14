class AddWebhookPayloadToSubscriptionActivities < ActiveRecord::Migration
  def change
    add_column :subscription_activities, :webhook_payload, :text
  end
end

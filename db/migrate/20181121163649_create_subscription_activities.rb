class CreateSubscriptionActivities < ActiveRecord::Migration
  def change
    create_table :subscription_activities do |t|
      t.belongs_to :user, index: true
      t.string :activity_type

      t.timestamps
    end
  end
end

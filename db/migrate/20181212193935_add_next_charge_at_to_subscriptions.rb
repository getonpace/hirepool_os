class AddNextChargeAtToSubscriptions < ActiveRecord::Migration
  def change
    add_column :subscriptions, :next_charge_at, :datetime
  end
end

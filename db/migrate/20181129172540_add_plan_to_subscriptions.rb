class AddPlanToSubscriptions < ActiveRecord::Migration
  def change
    add_column :subscriptions, :plan, :string
  end
end

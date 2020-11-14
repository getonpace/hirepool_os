class AddActiveAndEndDateToSubscriptions < ActiveRecord::Migration
  def change
    add_column :subscriptions, :active, :boolean, default: true
    add_column :subscriptions, :end_date, :datetime
  end
end

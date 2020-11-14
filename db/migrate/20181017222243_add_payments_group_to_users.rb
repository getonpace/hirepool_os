class AddPaymentsGroupToUsers < ActiveRecord::Migration
  def change
    add_column :users, :payments_group, :string
  end
end

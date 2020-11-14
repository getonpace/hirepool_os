class AddCerebroGroupToUsers < ActiveRecord::Migration
  def change
    add_column :users, :cerebro_group, :string
  end
end

class AddIntercomIdToUsers < ActiveRecord::Migration
  def change
    add_column :users, :intercom_id, :string
  end
end

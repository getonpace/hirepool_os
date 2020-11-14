class AddIntercomUserCreatedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :intercom_user_created_at, :datetime
  end
end

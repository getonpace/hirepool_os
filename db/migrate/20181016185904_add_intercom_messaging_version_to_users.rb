class AddIntercomMessagingVersionToUsers < ActiveRecord::Migration
  def change
    add_column :users, :intercom_messaging_version, :string
  end
end

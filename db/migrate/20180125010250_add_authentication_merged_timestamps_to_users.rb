class AddAuthenticationMergedTimestampsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :last_authentication_merged_at, :timestamp
    add_column :users, :authentication_merged_message_shown_at, :timestamp
  end
end

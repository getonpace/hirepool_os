class ChangeTokenColumnLengthOnAuthenticationsTable < ActiveRecord::Migration
  def up
    change_column :authentications, :token, :string, limit: 1000
  end

  def down
    say_with_time 'Shortening `authentications`.`token` length to 255 characters' do
      say 'NOTE: This may result in some data loss to authentication tokens!', true
      suppress_messages do
        change_column :authentications, :token, :string, limit: 255
      end
    end
  end
end

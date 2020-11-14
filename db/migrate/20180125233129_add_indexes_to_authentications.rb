class AddIndexesToAuthentications < ActiveRecord::Migration
  def change
    add_index :authentications, :provider
    add_index :authentications, :uid
    add_index :authentications, :email
    add_index :authentications, [:provider, :uid], unique: true
  end
end

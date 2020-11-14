class AddEmailSignups < ActiveRecord::Migration
  def change
    create_table :email_sign_ups do |t|
      t.string :email
      t.string :name
      t.timestamps null: false
    end
  end
end

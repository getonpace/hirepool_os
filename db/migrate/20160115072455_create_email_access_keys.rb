class CreateEmailAccessKeys < ActiveRecord::Migration
  def change
    create_table :email_access_keys do |t|
      t.string :email
      t.string :access_key

      t.timestamps null: false
    end

    add_index :email_access_keys, [:email, :access_key]
  end
end

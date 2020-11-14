class CreateAuthentications < ActiveRecord::Migration
  def change
    # Add table to hold User Authentications
    create_table :authentications do |t|
      t.references :user, index: true, foreign_key: true
      t.string :provider, null: false, default: 'email'
      t.string :uid, null: false, default: ''
      t.string :name
      t.string :email
      t.string :phone
      t.string :token
      t.datetime :token_expires_at
      t.text :params

      t.timestamps null: false
    end

    reversible do |change|
      change.up do
        say_with_time 'Copying existing authentication data to the new `authentications` table' do
          # Iterate through the Users, and copy the provider/uid columns to an
          #   associated Authentication, creating a new instance if necessary.
          User.find_each do |u|
            u.authentications.create! provider: u.provider, uid: u.uid, email: u.email
          end
        end
      end

      # NOTE: we don't need to define a #down method, because a down
      #   migration drops the authentications table entirely
      #change.down do
      #end
    end

    # Rename the old :provider and :uid columns, so to avoid confusion
    # TODO: remove the columns from the users table altogether.
    rename_column :users, :provider, :provider_deprecated
    rename_column :users, :uid, :uid_deprecated
  end
end

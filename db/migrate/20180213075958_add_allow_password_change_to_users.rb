class AddAllowPasswordChangeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :allow_password_change, :boolean, null: false, default: false

    reversible do |change|
      change.up do
        User.update_all allow_password_change: false
      end
    end
  end
end

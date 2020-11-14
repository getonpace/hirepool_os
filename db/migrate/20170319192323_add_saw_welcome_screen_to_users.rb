class AddSawWelcomeScreenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :saw_welcome_screen, :boolean
  end
end

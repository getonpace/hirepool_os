class AddCerebroOptInToUsers < ActiveRecord::Migration
  def change
    add_column :users, :cerebro_opt_in, :boolean, default: false
  end
end

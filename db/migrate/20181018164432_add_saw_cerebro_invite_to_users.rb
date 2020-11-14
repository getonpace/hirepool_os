class AddSawCerebroInviteToUsers < ActiveRecord::Migration
  def change
    add_column :users, :saw_cerebro_invite, :boolean, default: false
  end
end

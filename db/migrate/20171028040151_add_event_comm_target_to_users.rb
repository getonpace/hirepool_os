class AddEventCommTargetToUsers < ActiveRecord::Migration
  def change
    add_column :users, :event_comm_target, :boolean
  end
end

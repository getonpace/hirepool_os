class RemoveEventCommTargetFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :event_comm_target, :boolean
  end
end

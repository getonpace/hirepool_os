class AddEventPrepKitOptOutToUsers < ActiveRecord::Migration
  def change
    add_column :users, :event_prep_kit_opt_out, :bool
  end
end

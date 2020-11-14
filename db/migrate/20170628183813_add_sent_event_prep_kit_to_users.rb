class AddSentEventPrepKitToUsers < ActiveRecord::Migration
  def change
    add_column :users, :sent_event_prep_kit_1, :bool
    add_column :users, :sent_event_prep_kit_2, :bool
  end
end

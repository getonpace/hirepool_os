class AddPrepKitMessageToEvents < ActiveRecord::Migration
  def change
    add_column :events, :prep_kit_message, :int
  end
end

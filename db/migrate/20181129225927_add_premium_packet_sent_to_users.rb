class AddPremiumPacketSentToUsers < ActiveRecord::Migration
  def change
    add_column :users, :premium_packet_sent, :boolean, :default => false, :null => false
  end
end

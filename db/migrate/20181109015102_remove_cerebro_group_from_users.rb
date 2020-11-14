class RemoveCerebroGroupFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :cerebro_group, :string
  end
end

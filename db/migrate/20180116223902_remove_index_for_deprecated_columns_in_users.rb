class RemoveIndexForDeprecatedColumnsInUsers < ActiveRecord::Migration
  def change
    remove_index :users, column: [:uid_deprecated, :provider_deprecated]
  end
end

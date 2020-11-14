class AddLastAuthenticationMergedProviderToUsers < ActiveRecord::Migration
  def change
    add_column :users, :last_authentication_merged_provider, :string
  end
end

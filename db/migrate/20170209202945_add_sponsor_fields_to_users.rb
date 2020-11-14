class AddSponsorFieldsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :access_group_id, :integer
    add_column :users, :user_agreement_status, :string
    add_column :users, :sponsor, :string
    add_column :users, :is_admin, :boolean
    add_column :users, :is_test_account, :boolean
    add_column :users, :saw_user_agreement_at, :datetime
  end
end

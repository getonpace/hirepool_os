class ChangeOfferColumns < ActiveRecord::Migration
  def change
    rename_column :offers, :type, :offer_type
    change_column :offers, :additional_compensation, :string
  end
end

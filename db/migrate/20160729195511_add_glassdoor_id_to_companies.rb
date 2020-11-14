class AddGlassdoorIdToCompanies < ActiveRecord::Migration
  def change
    add_column :companies, :glassdoor_id, :string
  end
end

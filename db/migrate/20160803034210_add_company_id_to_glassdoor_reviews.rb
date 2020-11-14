class AddCompanyIdToGlassdoorReviews < ActiveRecord::Migration
  def change
    add_column :glassdoor_reviews, :company_id, :integer
  end
end

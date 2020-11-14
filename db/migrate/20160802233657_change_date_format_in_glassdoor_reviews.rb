class ChangeDateFormatInGlassdoorReviews < ActiveRecord::Migration
  def up
    change_column :glassdoor_reviews, :date, :date
  end

  def down
    change_column :glassdoor_reviews, :date, :datetime
  end
end

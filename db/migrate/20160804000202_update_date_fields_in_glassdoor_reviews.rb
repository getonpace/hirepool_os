class UpdateDateFieldsInGlassdoorReviews < ActiveRecord::Migration
  def change
    add_column :glassdoor_reviews, :review_date, :date
    rename_column :glassdoor_reviews, :date, :interview_date
  end
end

class AddColumnsForReviewsToCompanies < ActiveRecord::Migration
  def change
    add_column :companies, :interview_difficulty, :float
    add_column :companies, :interview_experiences_negative, :integer
    add_column :companies, :interview_experiences_neutral, :integer
    add_column :companies, :interview_experiences_positive, :integer
    add_column :companies, :interview_process_duration, :float
    add_column :companies, :interview_offers_accepted, :integer
    add_column :companies, :interview_offers_declined, :integer
    add_column :companies, :interview_no_offers, :integer
    add_column :companies, :interview_recent_reviews, :integer
    add_column :companies, :reviews_last_processed, :datetime
  end
end

class AddNotesToEventsInteractionsInterviewers < ActiveRecord::Migration
  def change
    add_column :events, :notes, :text
    add_column :interviewers, :notes, :text
    add_column :interviewers, :user_id, :integer
  end
end

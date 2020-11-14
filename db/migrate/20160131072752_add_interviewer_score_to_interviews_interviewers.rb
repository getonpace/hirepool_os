class AddInterviewerScoreToInterviewsInterviewers < ActiveRecord::Migration
  def change
    add_column :interviews_interviewers, :interviewer_score, :integer
  end
end

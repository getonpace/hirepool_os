class AddRoleMatchAndOneWordToInterviewsInterviewers < ActiveRecord::Migration
  def change
    add_column :interviews_interviewers, :role_match, :integer
    add_column :interviews_interviewers, :one_word, :string
  end
end

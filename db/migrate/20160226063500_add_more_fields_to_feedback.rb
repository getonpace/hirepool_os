class AddMoreFieldsToFeedback < ActiveRecord::Migration
  def change
    add_column :interviews_interviewers, :company_preparation, :integer
    add_column :interviews_interviewers, :excited, :integer
    add_column :interviews_interviewers, :notes, :text
  end
end

class AddRelationshipToInterviewers < ActiveRecord::Migration
  def change
    add_column :interviewers, :relationship, :string
  end
end

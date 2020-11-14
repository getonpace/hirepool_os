class AddCompanyIdToInterviewers < ActiveRecord::Migration
  def change
    add_column :interviewers, :company_id, :integer
  end
end

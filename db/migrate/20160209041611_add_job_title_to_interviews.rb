class AddJobTitleToInterviews < ActiveRecord::Migration
  def change
    add_column :interviews, :job_title, :string
  end
end

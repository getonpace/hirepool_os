class AddAppliedAndJobUrlToInterviews < ActiveRecord::Migration
  def change
    add_column :interviews, :applied, :boolean
    add_column :interviews, :job_url, :string
  end
end

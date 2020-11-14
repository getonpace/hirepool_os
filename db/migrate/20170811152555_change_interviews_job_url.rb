class ChangeInterviewsJobUrl < ActiveRecord::Migration
  def up
    change_column :interviews, :job_url, :text
  end

  def down
    change_column :interviews, :job_url, :string
  end

end

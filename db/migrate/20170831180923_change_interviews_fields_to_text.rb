class ChangeInterviewsFieldsToText < ActiveRecord::Migration
  def up
    change_column :interviews, :role, :text
    change_column :interviews, :location, :text
    change_column :interviews, :referrer_name, :text
    change_column :interviews, :referrer_email, :text
    change_column :interviews, :job_title, :text
    change_column :interviews, :source, :text
  end

  def down
    change_column :interviews, :role, :string
    change_column :interviews, :location, :string
    change_column :interviews, :referrer_name, :string
    change_column :interviews, :referrer_email, :string
    change_column :interviews, :job_title, :string
    change_column :interviews, :source, :string
  end
end

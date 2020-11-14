class AddArchivedToInterviews < ActiveRecord::Migration
  def change
    add_column :interviews, :archived, :boolean
  end
end

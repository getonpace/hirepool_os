class AddSourceAndPinnedToInterviews < ActiveRecord::Migration
  def change
    add_column :interviews, :source, :string
    add_column :interviews, :pinned, :boolean
  end
end

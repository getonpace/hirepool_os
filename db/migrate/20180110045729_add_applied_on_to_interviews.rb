class AddAppliedOnToInterviews < ActiveRecord::Migration
  def change
    add_column :interviews, :applied_on, :date
  end
end

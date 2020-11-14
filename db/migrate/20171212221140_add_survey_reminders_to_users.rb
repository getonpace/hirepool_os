class AddSurveyRemindersToUsers < ActiveRecord::Migration
  def change
    add_column :users, :last_survey_reminder_date, :datetime
    add_column :users, :never_show_survey_reminder, :boolean, :default => false
  end
end

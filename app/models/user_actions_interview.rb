class UserActionsInterview < ActiveRecord::Base
  self.table_name = 'user_actions_interviews'
  belongs_to :user_action
  belongs_to :interview
  accepts_nested_attributes_for :interview

  def as_json(options={})
    super().merge(:interview => self.interview)
  end

end

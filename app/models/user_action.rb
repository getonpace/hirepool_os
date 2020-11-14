class UserAction < ActiveRecord::Base
  belongs_to :user
  belongs_to :action
  belongs_to :modal
  belongs_to :page
  belongs_to :sort_param
  belongs_to :event
  has_many :user_actions_interviews
  has_many :interviews, :through => :user_actions_interviews

  def as_json(options={})
    super().merge(:user => self.user.as_json, :interviews => self.interviews.as_json({:minimal_data => true}))
  end

end

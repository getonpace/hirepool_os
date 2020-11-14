class UsersUserTrackingTag < ActiveRecord::Base
  self.table_name = 'users_user_tracking_tags'
  belongs_to :user
  belongs_to :user_tracking_tag
  accepts_nested_attributes_for :user_tracking_tag

  def as_json(options={})
    super().merge(:user_tracking_tag => self.user_tracking_tag)
  end

end

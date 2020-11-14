class AccessGroup < ActiveRecord::Base
  has_many :users
  has_many :access_groups_user_tracking_tags
  has_many :user_tracking_tags, :through => :access_groups_user_tracking_tags

  validates_uniqueness_of :key

  def as_json(options={})
    super().merge(:user_tracking_tags => self.user_tracking_tags.as_json)
  end

end

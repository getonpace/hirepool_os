class CollaboratorFeedback < ActiveRecord::Base
  self.table_name = 'collaborator_feedbacks'
  belongs_to :interview
  belongs_to :collaborator

  def as_json(options={})
    if options[:admin_data]
      super(:only => [:rating, :date_asked, :date_completed, :created_at, :updated_at]).merge(:interview => self.interview.as_json({:for_admin_event => true}), :collaborator => self.collaborator)
    else
      super().merge(:collaborator => self.collaborator)
    end
  end

  scope :updated_within, ->(date) { where('updated_at > ?', date) }

  scope :with_user_sponsor, ->(user_sponsor) do
    joins(interview: :user).where(user: {sponsor: user_sponsor})
  end

  scope :with_accepted_user_agreement, -> do
    joins(interview: :user).merge(User.with_accepted_agreement)
  end

  scope :excluding_test_and_admin_users, -> do
    joins(interview: :user).merge(
      User.excluding_booleans([:is_test_account, :is_admin])
    )
  end
end

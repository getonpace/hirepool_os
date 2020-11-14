class Interview < ActiveRecord::Base
  belongs_to :user
  has_many :events
  has_many :interactions, :through => :events
  has_many :collaborator_feedbacks
  has_many :collaborators, :through => :collaborator_feedbacks
  has_one :offer
  belongs_to :company

  accepts_nested_attributes_for :events
  accepts_nested_attributes_for :company

  validates_presence_of :user_id

  def as_json(options={})
    if options[:minimal_data]
      super().merge(:company => self.company)
    elsif options[:for_admin_event]
      super(:only => [:job_title, :role, :source]).merge(:company => self.company.name)
    elsif options[:admin_data]
      super(:only => [:job_title, :role, :source, :created_at]).merge(:company => self.company.name, :events_count => self.events.size, :offer_status => get_offer_status(self.offer), :total_days => get_total_days(self.events))
    else
      super().merge(:company => self.company.as_json).merge(:events => self.events.as_json).merge(:offer => self.offer).merge(:collaborator_feedbacks => self.collaborator_feedbacks.as_json).merge(:all_participants => get_all_interviewers)
    end
  end

  scope :updated_within, ->(date) { where('updated_at > ?', date) }

  scope :with_user_sponsor, ->(user_sponsor) do
    joins(:user).where(user: {sponsor: user_sponsor})
  end

  scope :with_accepted_user_agreement, -> do
    joins(:user).merge(User.with_accepted_agreement)
  end

  scope :excluding_test_and_admin_users, -> do
    joins(:user).merge(User.excluding_booleans([:is_test_account, :is_admin]))
  end

  private

    def get_all_interviewers
      interviewers = Interviewer.where(:company_id => self.company_id, :user_id => self.user_id)
    end

    def get_offer_status (offer)
      if offer
        return offer.status
      end
      return nil
    end

    def get_total_days (events)
      @earliest = nil
      @latest = nil
      if events && events.length > 1
        events.each { |event|
          #update earliest and latest
          if event.date
            date = event.date.to_date
            if @earliest
              if date < @earliest
                @earliest = date
              end
            else
              @earliest = date
            end
            if @latest
              if date > @latest
                @latest = date
              end
            else
              @latest = date
            end
          end
        }
      end
      if @earliest && @latest
        # get day difference
        return (@latest - @earliest).to_i
      end
      return nil
    end
end

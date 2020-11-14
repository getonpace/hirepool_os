class Interviewer < ActiveRecord::Base
  has_many :interactions_interviewers
  has_many :interactions, :through => :interactions_interviewers
  has_many :events_interviewers
  has_many :events, :through => :events_interviewers
  belongs_to :users
  belongs_to :companies

  def as_json(options={})
    if options[:overview_event_interviewer]
      super(:only => [:name, :email, :company_id, :user_id, :created_at, :updated_at, :relationship]).merge(:interview => get_interview_from_event(self), :excited => self.events_interviewers[self.events_interviewers.length - 1].excited, :culture_val => get_culture_val_from_event(self))
    elsif options[:overview_interaction_interviewer]
      super(:only => [:name, :email, :company_id, :user_id, :created_at, :updated_at, :relationship]).merge(:interview => get_interview_from_interaction(self), :excited => self.interactions_interviewers[self.interactions_interviewers.length - 1].excited, :culture_val => get_culture_val_from_interaction(self))
    else
      super()
    end
  end

  private

    def get_interview_from_event (interviewer)
      interviewer.events[interviewer.events.length - 1].interview.as_json({:for_admin_event => true})
    end

    def get_culture_val_from_event (interviewer)
      interviewer.events[interviewer.events.length - 1].culture_val
    end

    def get_interview_from_interaction (interviewer)
      interviewer.interactions[interviewer.interactions.length - 1].event.interview.as_json({:for_admin_event => true})
    end

    def get_culture_val_from_interaction (interviewer)
      interviewer.interactions[interviewer.interactions.length - 1].culture_val
    end

end

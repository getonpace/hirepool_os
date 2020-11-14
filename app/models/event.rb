class Event < ActiveRecord::Base
  belongs_to :interview
  has_many :user_actions
  has_many :events_interviewers
  has_many :interviewers, :through => :events_interviewers
  accepts_nested_attributes_for :events_interviewers
  has_many :interactions
  has_many :interactions_interviewers, :through => :interactions
  accepts_nested_attributes_for :interactions

  def as_json(options={})
    if options[:admin_data]
      super(:only => [:style, :substyle, :date, :created_at, :updated_at]).merge(:interview => self.interview.as_json({:for_admin_event => true}), :participants => get_participants_count(self), :has_feedback => has_feedback(self), :detail_level => get_detail_level(self))
    else
      super().merge(:interactions => self.interactions.as_json).merge(:interviewers => self.events_interviewers.as_json)
    end
  end

  class << self
    def in_order
      order(created_at: :asc)
    end

    def recent(n)
      in_order.endmost(n)
    end

    def endmost(n)
      all.only(:order).from(all.reverse_order.limit(n), table_name)
    end

    def interviews_count
      where(substyle: "interview").count
    end

    def in_person_interviews_count
      where(substyle: "interview", style: "in-person").count
    end
  end

  private

    def get_participants_count (event)
      @participants_count = event.interviewers.size
      event.interactions.each do |interaction|
        @participants_count = @participants_count + interaction.interviewers.size
      end
      return @participants_count
    end

    def has_feedback (event)
      if event[:culture_val] || event[:one_word]
        return true
      end

      @event_has_feedback = false
      event.events_interviewers.each do |participant|
        if participant[:excited]
          @event_has_feedback = true
        end
      end
      if @event_has_feedback
        return @event_has_feedback
      end

      event.interactions.each do |interaction|
        if interaction[:culture_val] || interaction[:one_word]
          @event_has_feedback = true
        end
        interaction.interactions_interviewers.each do |participant|
          if participant[:excited]
            @event_has_feedback = true
          end
        end
      end
      return @event_has_feedback
    end

    def get_detail_level (event)
      if event.interactions.size > 0
        return 'interaction-level'
      elsif event.interviewers.size > 1
        return 'participants-level'
      else
        return 'poc-level'
      end
    end

end


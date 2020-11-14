class InterviewsInterviewer < ActiveRecord::Base
  self.table_name = 'interviews_interviewers'
  belongs_to :interview
  belongs_to :interviewer
  accepts_nested_attributes_for :interviewer

  def as_json(options={})
    super().merge(:interviewer => self.interviewer)
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
  end

end

class Interaction < ActiveRecord::Base
  belongs_to :event
  has_many :interactions_interviewers
  has_many :interviewers, :through => :interactions_interviewers
  accepts_nested_attributes_for :interactions_interviewers

  def as_json(options={})
    super().merge(:interviewers => self.interactions_interviewers.as_json)
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

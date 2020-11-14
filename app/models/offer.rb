class Offer < ActiveRecord::Base
  belongs_to :interview

  def as_json(options={})
    if options[:admin_data]
      super(:only => [:status, :base_salary, :total_target_compensation, :created_at, :updated_at]).merge(:interview => self.interview.as_json({:for_admin_event => true}))
    else
      super()
    end
  end

end

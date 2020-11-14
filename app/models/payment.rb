class Payment < ActiveRecord::Base
  belongs_to :user

  def as_json(options={})
    if options[:admin_data]
      super().merge(:user_name => self.user.name).merge(:user_email => self.user.email)
    elsif options[:limited_data]
      {
        amount: self.amount,
        attempted_at: self.attempted_at,
        created_at: self.created_at,
        id: self.id,
        status: self.status,
        updated_at: self.updated_at,
        user_id: self.user_id
      }
    else
      super()
    end
  end

end

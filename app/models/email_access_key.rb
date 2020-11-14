class EmailAccessKey < ActiveRecord::Base
  validates_uniqueness_of :email

  def matches?(key)
    access_key && access_key == key
  end
end

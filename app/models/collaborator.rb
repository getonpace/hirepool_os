class Collaborator < ActiveRecord::Base
  has_many :collaborator_feedbacks
end

class Resume < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :user_id

  mount_uploader :resume_file, ResumeUploader
end
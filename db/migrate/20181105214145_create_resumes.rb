class CreateResumes < ActiveRecord::Migration
  def change
    create_table :resumes do |t|
      t.belongs_to :user, index: true
      t.string :resume_file

      t.timestamps
    end
  end
end

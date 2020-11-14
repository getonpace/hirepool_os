class AddOriginalFileNameToResumes < ActiveRecord::Migration
  def change
    add_column :resumes, :original_filename, :string
  end
end

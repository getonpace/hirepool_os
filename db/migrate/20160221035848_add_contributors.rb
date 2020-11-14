class AddContributors < ActiveRecord::Migration
  def change
    create_table :collaborators do |t|
      t.string :name
      t.string :email
    end

    create_table :collaborator_feedbacks do |t|
      t.belongs_to :interview, index: true
      t.belongs_to :collaborator, index: true
      t.text :feedback
      t.integer :rating
      t.string :token
      t.datetime :date_asked
      t.datetime :date_completed
      t.timestamps null: false
    end
  end
end

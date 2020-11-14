class AddColumnsForImprovedEventStructure < ActiveRecord::Migration
  def change
    add_column :events, :substyle, :string
    add_column :events, :culture_val, :integer
    add_column :events, :one_word, :string

    create_table :events_interviewers do |t|
      t.belongs_to :event, index: true
      t.belongs_to :interviewer, index: true
      t.string :relationship
      t.integer :excited
      t.boolean :is_poc
      t.timestamps null: false
    end

  end
end

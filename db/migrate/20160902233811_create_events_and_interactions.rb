class CreateEventsAndInteractions < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.belongs_to :interview, index: true
      t.belongs_to :interviewer, index: true
      t.string :interviewer_relationship
      t.string :style
      t.datetime :date
      t.boolean :time_specified
      t.timestamps null: false
    end

    create_table :interactions do |t|
      t.belongs_to :event, index: true
      t.string :style
      t.integer :culture_val
      t.string :one_word
      t.timestamps null: false
    end

    create_table :interactions_interviewers do |t|
      t.belongs_to :interaction, index: true
      t.belongs_to :interviewer, index: true
      t.string :relationship
      t.integer :excited
      t.timestamps null: false
    end
  end
end

class CreateSurveys < ActiveRecord::Migration
  def change
    create_table :surveys do |t|
      t.string :name
      t.datetime :date_taken
      t.belongs_to :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end

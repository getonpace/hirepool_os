class CreateGlassdoorReviews < ActiveRecord::Migration
  def change
    create_table(:glassdoor_reviews, id: :string) do |t|
      t.integer :difficulty
      t.integer :experience
      t.integer :duration
      t.integer :offer
      t.string :source
      t.datetime :date
      t.string :types
    end
  end
end

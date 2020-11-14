class AddInterviewSchema < ActiveRecord::Migration
  def change
    create_table :interviews do |t|
      t.belongs_to :user, index: true
      t.string :role
      t.string :location
      t.string :referrer_name
      t.string :referrer_email
      t.datetime :date
      t.timestamps null: false
    end
 
    create_table :interviewers do |t|
      t.string :name
      t.string :email
      t.string :role
      t.string :gender
      t.timestamps null: false
    end

    create_table :companies do |t|
      t.string :name
      t.integer :size
      t.string :location
      t.timestamps null: false
    end

    create_table :offers do |t|
      t.belongs_to :interview, index: true
      t.string :status
      t.string :type
      t.decimal :base_salary
      t.decimal :total_target_compensation
      t.decimal :additional_compensation
      t.date :expiration_date
      t.timestamps null: false
    end
 
    create_table :interviews_interviewers do |t|
      t.belongs_to :interview, index: true
      t.belongs_to :interviewer, index: true
      t.string :style
      t.datetime :date
      t.string :relationship
      t.integer :duration_minutes
      t.integer :timeliness
      t.integer :preparation
      t.integer :difficulty
      t.integer :experience_score
      t.integer :culture_val
      t.string :location
      t.timestamps null: false
    end

    create_table :companies_interviews do |t|
      t.belongs_to :interview, index: true
      t.belongs_to :company, index: true
      t.string :referrer_name
      t.string :referrer_email
      t.string :score
      t.string :location
      t.timestamps null: false
    end
  end
end

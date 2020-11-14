class ChangeOneWordColumnsToText < ActiveRecord::Migration
  def up
    change_column :interviews_interviewers, :one_word, :text
    change_column :events, :one_word, :text
    change_column :interactions, :one_word, :text
  end

  def down
    change_column :interviews_interviewers, :one_word, :string
    change_column :events, :one_word, :string
    change_column :interactions, :one_word, :string
  end
end

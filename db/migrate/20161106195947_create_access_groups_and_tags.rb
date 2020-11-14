class CreateAccessGroupsAndTags < ActiveRecord::Migration
  def change
    create_table :user_tracking_tags do |t|
      t.string :tag
      t.timestamps null: false
    end

    create_table :access_groups do |t|
      t.string :title
      t.text :description
      t.date :disable
      t.string :key
      t.timestamps null: false
    end

    create_table :users_user_tracking_tags do |t|
      t.belongs_to :user, index: true
      t.belongs_to :user_tracking_tag, index: true
      t.timestamps null: false
    end

    create_table :access_groups_user_tracking_tags do |t|
      t.belongs_to :access_group, index: true
      t.belongs_to :user_tracking_tag, index: true
      t.timestamps null: false
    end

  end
end

class AddUserActionLogging < ActiveRecord::Migration
  def change

    create_table :user_actions do |t|
      t.belongs_to :user, index: true
      t.belongs_to :action, index: true
      t.belongs_to :modal, index: true
      t.belongs_to :page, index: true
      t.belongs_to :sort_param, index: true
      t.belongs_to :event, index: true
      t.timestamps null: false
    end

    create_table :user_actions_interviews do |t|
      t.belongs_to :user_action, index: true
      t.belongs_to :interview, index: true
      t.timestamps null: false
    end

    create_table :actions do |t|
      t.string :name
      t.timestamps null: false
    end

    create_table :modals do |t|
      t.string :name
      t.timestamps null: false
    end

    create_table :pages do |t|
      t.string :name
      t.timestamps null: false
    end

    create_table :sort_params do |t|
      t.string :name
      t.timestamps null: false
    end

  end
end

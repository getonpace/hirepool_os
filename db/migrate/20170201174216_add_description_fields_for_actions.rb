class AddDescriptionFieldsForActions < ActiveRecord::Migration
  def change
    add_column :actions, :description, :string
    add_column :pages, :description, :string
    add_column :modals, :description, :string
    add_column :sort_params, :description, :string
  end
end

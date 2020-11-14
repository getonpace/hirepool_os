class AddNeedFtuOpportunitiesIndexToUsers < ActiveRecord::Migration
  def change
    add_column :users, :need_ftu_opportunities_index, :boolean, default: true

    reversible do |change|
      change.up do
        say_with_time 'Setting existing users `need_ftu_opportunities_index` to false' do
          User.update_all(need_ftu_opportunities_index: false)
        end
      end
      # NOTE: we don't need to define a #down method, because a down
      #   migration drops the need_ftu_opportunities_index column
    end

  end
end

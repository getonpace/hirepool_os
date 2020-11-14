class AddNeedFtuOpportunityDetailsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :need_ftu_opportunity_details, :boolean, default: true

    reversible do |change|
      change.up do
        say_with_time 'Setting existing users `need_ftu_opportunity_details` to false' do
          User.update_all(need_ftu_opportunity_details: false)
        end
      end
      # NOTE: we don't need to define a #down method, because a down
      #   migration drops the need_ftu_opportunity_details column
    end

  end
end

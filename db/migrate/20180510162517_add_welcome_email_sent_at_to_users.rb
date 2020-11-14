class AddWelcomeEmailSentAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :welcome_email_sent_at, :timestamp

    reversible do |change|
      change.up do
        say_with_time 'Setting existing users `welcome_email_sent_at` to now' do
          User.update_all(welcome_email_sent_at: DateTime.now)
        end
      end
      # NOTE: we don't need to define a #down method, because a down
      #   migration drops the welcome_email_sent_at column
    end

  end
end

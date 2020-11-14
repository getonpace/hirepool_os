if Rails.env.development? || Rails.env.test?
  require 'rubocop/rake_task'

  desc 'Run RuboCop'
  RuboCop::RakeTask.new(:rubocop) do |task|
    task.formatters = ['fuubar', 'offenses', 'worst']
    task.fail_on_error = false # don't abort rake on failure
  end
end

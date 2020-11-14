# config/initializers/datadog.rb
if defined? Datadog
  Datadog.configure do |c|
      c.use :rails, service_name: "#{Rails.env}-rails-app"
  end
end
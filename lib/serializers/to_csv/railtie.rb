# frozen_string_literal: true

# Register a renderer for the CSV format
ActionController::Renderers.add :csv do |obj, options|
  filename = (options[:filename] || action_name).to_s
  filename += '.csv' unless filename =~ /\.csv$/
  str = obj.respond_to?(:to_csv) ? obj.to_csv : obj.to_s
  file_disposition = "attachment; filename=#{filename}"
  send_data(str, type: Mime::CSV, disposition: file_disposition)
end

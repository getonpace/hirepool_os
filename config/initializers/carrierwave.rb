CarrierWave.configure do |config|
  if Rails.env.staging? || Rails.env.production?
    config.fog_provider = 'fog/aws'

    config.fog_credentials = {
      provider:              'AWS',
      aws_access_key_id:     ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
      region:                'us-west-2',
    }

    config.fog_directory                    = ENV['S3_BUCKET_NAME']
    config.fog_public                       = false
    config.fog_authenticated_url_expiration = 5
    config.fog_authenticated_url_expiration = 300
    config.storage                          = :fog
  else
    config.storage = :file
    config.enable_processing = Rails.env.development?
  end
end
class Api::S3UploadController < ApplicationController
  before_action :authenticate_user!

  # https://github.com/asafdav/ng-s3upload
  # TODO set ENV vars
  def s3_access_token
    render json: {
      policy:    s3_upload_policy,
      signature: s3_upload_signature,
      key:       'add_secret_keys'
    }
  end

  protected

    def s3_upload_policy
      @policy ||= create_s3_upload_policy
    end

    def create_s3_upload_policy
      Base64.encode64(
        {
          "expiration" => 1.hour.from_now.utc.xmlschema,
          "conditions" => [
            { "bucket" =>  'hirepool-images' },
            [ "starts-with", "$key", "" ],
            { "acl" => "public-read" },
            [ "starts-with", "$Content-Type", "" ],
            [ "content-length-range", 0, 10 * 1024 * 1024 ]
          ]
        }.to_json).gsub(/\n/,'')
    end

    def s3_upload_signature
      Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), 'add_secret_keys', s3_upload_policy)).gsub("\n","")
    end
end

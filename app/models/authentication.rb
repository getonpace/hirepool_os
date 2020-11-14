class Authentication < ActiveRecord::Base
  include DeviseTokenAuth::Concerns::UserOmniauthCallbacks

  class << self
    # Build an authentication record from an Omniauth `auth_hash`
    #   through it's associated user.
    # @param auth_hash [Hash] the `auth_hash` response from an Omniauth redirect
    #
    # @return [Authentication] the new authentication instance
    #
    # @example Usage
    #
    #   # The JSON response from an oauth callback
    #   omniauth_hash = {'provider' => 'facebook', 'uid' => '1233456', ...}
    #
    #   @user = User.find(1)
    #   @user.authentications.build_from_auth(omniauth_hash)
    #
    def build_from_auth(auth_hash)
      auth_hash = auth_hash.with_indifferent_access

      new do |auth|
        # Set the Authentication provider and uid from the auth_hash
        auth.provider = auth_hash[:provider]
        auth.uid = auth_hash[:uid]

        # Set the Authentication name and email from the auth_hash[:info]
        auth_hash.fetch(:info, {}).tap do |info|
          auth.name = info[:name]
          auth.email = info[:email]
        end

        # Set the Authentication token and expiration from the auth_hash[:credentials]
        auth_hash.fetch(:credentials, {}).tap do |credentials|
          auth.token = credentials[:token]

          if credentials[:expires_at].present?
            auth.token_expires_at = Time.zone.at(credentials[:expires_at].to_f)
          end
        end

        # # Serialize the entire json auth_hash, for archival
        # auth.params = auth_hash
      end
    end

    # Build an email provided authentication (w/o OAuth) through an associated
    #     user.
    # @param email [string] the unique email address to identify a user by
    #
    # @return [Authentication] the new authentication instance
    #
    # @example Usage
    #
    #   @user = User.find(1)
    #   @user.authentications.build_from_email('morty@example.tld')
    #
    def build_from_email(email)
      new do |auth|
        auth.provider = 'email'
        auth.email = email
        auth.uid = email
      end
    end
  end

  PROVIDERS = %i(facebook github linkedin twitter google_oauth2).freeze
    # :facebook_for_friends

  belongs_to :user, inverse_of: :authentications

  validates :user, :provider, presence: true
  validates :uid, presence: true, uniqueness: {scope: :provider}

  serialize :params, JSON

  # TODO: add custom validator for token and params -- they're req'd
  #   for oauth, but not for email auth records

  def ==(other_auth)
    (provider == other_auth.provider) && (uid == other_auth.uid)
  end
end

module DeviseTokenAuthOverrides
  class OmniauthCallbacksController < DeviseTokenAuth::OmniauthCallbacksController

    before_action :set_resource_for_matching_provider_email, only: :omniauth_success
    after_action :create_intercom_user_unless_created, only: [:omniauth_success]

    def omniauth_success
      User.transaction do
        super do |resource|
          # TODO: What happens if a user tries to authenticate with an oauth
          #       provider they already have, but with a different oauth uid
          #       (i.e., they have multiple accounts with the same oauth provider)?

          # Build an Authentication instance from the auth_hash response
          oauth_authentication = Authentication.build_from_auth(auth_hash)

          # TODO: In a similar vein to the lazy evaluation of AR::Relation objects
          #       in the after_add association callback in the User model, the
          #       authentications association proxy lazy loads the collection.
          #       Calling `#all` here force loads the target collection.
          #       This likely changes in future versions of Rails.

          # Check if the oauth_authentication exists for the resource already
          # unless resource.authentications.include? oauth_authentication
          unless resource.authentications.all.include? oauth_authentication
            # Associate the new oauth_authentication with the resource
            resource.authentications << oauth_authentication

            AccessKeyService.new(resource).setup_sponsor_and_tags

            resource.save!
          end
        end
      end
    end

    protected

    # Explicitly disable :confirmable for all omniauth callback requests.
    #   Note: this does NOT remove confirmable's methods from the @resource.
    #   It disables the confirmation email notification (and therefore no
    #   confirmation token is generated).
    #
    # This is a bit of a hack.  Burying the call to skip the delivery of
    #   the confirmation notification is probably a bad idea.
    #
    # @return [False] disable the confirmable module
    #
    def confirmable_enabled?
      # If :confirmable is normally enabled, ensure that confirmation
      #   emails are not sent for omniauth callbacks.
      super && @resource.skip_confirmation_notification!

      # Explicitly disable :confirmable
      false
    end

    # Check for an existing resource with an email that matches the email from
    #   the oauth provider. Assigns the @resource variable if an existing
    #   resource is found.
    #
    # @return [ActiveRecord::Base] the existing resource, if found.
    #
    def set_resource_for_matching_provider_email
      auth_hash_info = auth_hash.fetch('info', {})
      @resource = resource_class.find_by(email: auth_hash_info['email'])
    end
  end
end

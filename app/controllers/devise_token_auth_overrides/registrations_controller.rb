module DeviseTokenAuthOverrides
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    protect_from_forgery except: [:create, :destroy, :update]

    before_action :email_authentication, :set_resource_for_matching_provider_email, only: :create

    def create
      User.transaction do
        super do |resource|
          # TODO: In a similar vein to the lazy evaluation of AR::Relation objects
          #       in the after_add association callback in the User model, the
          #       authentications association proxy lazy loads the collection.
          #       Calling `#all` here force loads the target collection.
          #       This likely changes in future versions of Rails.

          # Check if the email_authentication exists for the resource already
          # unless resource.authentications.include? email_authentication
          unless resource.authentications.all.include? @email_authentication

            # If there was already a user that we are adding a new authentication record to, set the password
            # (because oauth users get weird nonsense passwords)
            if resource.authentications.any?
              resource.password = password_param
            end

            # Associate the new oauth_authentication with the resource
            resource.authentications << @email_authentication

            # update the access key and sponsor if a new one is passed via params
            resource.access_key = access_key_param unless access_key_param.nil?
            AccessKeyService.new(resource).setup_sponsor_and_tags

            resource.save!
          end
        end
      end
    end

    protected

    # Check for an existing resource with an email that matches the email from
    #   the oauth provider. Assigns the @resource variable if an existing
    #   resource is found.
    #
    # @return [ActiveRecord::Base] the existing resource, if found.
    #
    def set_resource_for_matching_provider_email
      existing_resource = resource_class.for_authentication_of(email: email_param).first
      if existing_resource
        unless existing_resource.authentications.all.include? @email_authentication
          @resource = existing_resource
        else
          if existing_resource && !existing_resource.confirmed_at
            @resource = existing_resource
          end
        end
      end
    end

    def email_authentication
      @email_authentication = Authentication.build_from_email(email_param)
    end

    def email_param
      params.require(:email)
    end

    def password_param
      params.require(:password)
    end

    def access_key_param
      params.permit(:access_key)[:access_key]
    end

  end
end

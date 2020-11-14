# frozen_string_literal: true

module DeviseTokenAuthOverrides
  class SessionsController < DeviseTokenAuth::SessionsController
    before_action :find_resource_from_authentication_field, only: [:create]
    before_action :check_resource_credentials, only: [:create]
    before_action :check_resource_confirmation, only: [:create]

    def create
      if @resource.present? && valid_params? && resource_active_for_authentication?
        # These instance variables are required when updating the auth headers
        # at the end of the request, see:
        #   DeviseTokenAuth::Concerns::SetUserByToken#update_auth_header
        @client_id, @token = @resource.create_token
        @provider = 'email'
        @provider_id = @resource.email
        @resource.save

        # Sign in via Warden, but don't store in the session
        sign_in(devise_mapping.name, @resource, store: false, bypass: false)

        yield @resource if block_given?

        render_create_success
      else
        render_create_error_bad_credentials
      end
    end

    protected

    def find_resource_from_authentication_field
      return unless field.present?
      @resource = resource_class.find_resource(field_value, field)
      render_create_error_bad_credentials unless @resource.present?
    end

    def check_resource_credentials
      render_create_error_bad_credentials unless valid_password? && resource_valid_for_authentication?
    end

    def check_resource_confirmation
      render_create_error_not_confirmed unless @resource.confirmed_for_authentication?
    end

    private

    def field
      @_field ||= resource_class.authentication_field_for resource_params.keys.map(&:to_sym)
    end

    def field_value
      @_field_value ||= get_case_insensitive_field_from_resource_params(field)
    end

    def valid_params?(key=field, value=field_value)
      super(key, value)
    end

    # TODO: Re-factor to use the safe-access operator (`&.`)
    #       after upgrade to Ruby 2.3+.
    def resource_active_for_authentication?
      !@resource.respond_to?(:active_for_authentication?) || @resource.active_for_authentication?
    end

    # TODO: Re-factor to use the safe-access operator (`&.`)
    #       after upgrade to Ruby 2.3+.
    def resource_valid_for_authentication?
      @resource.respond_to?(:valid_for_authentication?) && @resource.valid_for_authentication? { valid_password? }
    end

    def valid_password?
      @resource.valid_password?(resource_params[:password])
    end
  end
end


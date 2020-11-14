module DeviseTokenAuth
  class ConfirmationsController < DeviseTokenAuth::ApplicationController
    # GET /api/auth/confirmation(.:format)
    # Arrive here after clicking on confirmation link in email.
    def show
      # From Devise::Models::Confirmable::ClassMethods#confirm_by_token:
      #   Find a user by its confirmation token and try to confirm it.
      #   If no user is found, returns a new user with an error.
      #   If the user is already confirmed, create an error for the user
      @resource = resource_class.confirm_by_token(params[:confirmation_token])
      yield @resource if block_given?

      # If the user was just confirmed successfully, it will not have errors
      if @resource.errors.empty?
        # Generate a new auth client_id and token
        client_id, token = @resource.create_token

        # Sign in the user; updates tracked fields
        sign_in(@resource)
        @resource.save!

        redirect_to @resource.build_auth_url(
                      confirm_success_redirect_url,
                      redirect_success_headers(client_id, token)
                    )

      # Otherwise there was an error
      else
        render_confirmation_error
      end
    end

    protected

    def confirm_success_redirect_url
      params[:redirect_url] || DeviseTokenAuth.default_confirm_success_url
    end

    def redirect_success_headers(cid, token)
      build_redirect_headers(token, cid, account_confirmation_success: true)
    end

    def render_confirmation_error
      render json: {
        success: false,
        errors: resource_errors
      }, status: 422
    end
  end
end

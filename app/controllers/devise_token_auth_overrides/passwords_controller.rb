# NOTE: It is probably worth testing removing this override. Nearly the
#   entire implementation here is the same as in the `devise_token_auth` gem.
#   Diff noted in inline comments.
#
# Actual identical code was removed.

module DeviseTokenAuthOverrides
  class PasswordsController < DeviseTokenAuth::PasswordsController

    protected

    # NOTE: Default response status code from `devise_token_auth` is 422
    #
    def render_create_error_not_allowed_redirect_url
      response = {
        status: 'error',
        data:   resource_data
      }
      message = I18n.t("devise_token_auth.passwords.not_allowed_redirect_url", redirect_url: @redirect_url)
      render_error(403, message, response)
    end

    # NOTE: Default response from `devise_token_auth` is 400, with errors passed in
    #
    def render_create_error
      render json: {
        success: false,
        errors: @errors,
      }, status: @error_status
    end

    # NOTE: Default response status code from `devise_token_auth` is 404 Not Found
    #
    def render_edit_error
      render json: {
        success: false,
        errors: ['Unauthorized']
      }, status: 401
    end

    # NOTE: Default response from `devise_token_auth` slightly different
    #
    def render_update_success
      render json: {
        success: true,
        data: {
          user: @resource,
          message: I18n.t("devise_token_auth.passwords.successfully_updated")
        }
      }
    end

    private

    # NOTE: Parent implementation in `devise_token_auth` only permits :email and :reset_password_token
    #
    # Additional parameters are permitted here
    def resource_params
      params.permit(:email, :reset_password_token, :password, :password_confirmation, :current_password)
    end
  end
end

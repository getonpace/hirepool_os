module DeviseTokenAuthOverrides
  class ConfirmationsController < DeviseTokenAuth::ConfirmationsController
    after_action :create_intercom_user_after_confirmation, only: :show
    after_action :update_authentication_merged, only: :show

    def new
      @resource = resource_class.find_by_email(email_params)
      if @resource && @resource.authentications.find_by(provider: 'email')
        @resource.resend_confirmation_instructions
        if @resource.errors.empty?
          render :json => { :success => true }
        else
          if @resource.errors.messages.key? :email
            if @resource.errors.messages[:email].include? "was already confirmed, please try signing in"
              url = "#{request.protocol}#{request.host}:#{request.port}"
              @resource.send_already_confirmed_email(url)
              render :json => { :success => true }
            else
              render :json => { :success => false, :error => "nope" }, :status => 403
            end
          else
            render :json => { :success => false, :error => "nope" }, :status => 403
          end
        end
      else
        render :json => { :success => false, :error => "account_not_found" }, :status => 403
      end
    end

    def render_confirmation_error
      if @resource.errors.messages.key? :email
        if @resource.errors.messages[:email].include? "was already confirmed, please try signing in"
          first_name = @resource.name.present? && @resource.name.split[0] || 'there'
          url = "#{request.protocol}#{request.host}:#{request.port}"
          if url.index("localhost")
            url = "#{url}/#/confirm_email/?already_confirmed=true&name=#{first_name}"
          else
            url = "#{url}/app/#/confirm_email/?already_confirmed=true&name=#{first_name}"
          end
          redirect_to url
        elsif @resource.errors.messages[:email].include? "needs to be confirmed within 7 days, please request a new one"
          first_name = @resource.name.present? && @resource.name.split[0] || 'there'
          url = "#{request.protocol}#{request.host}:#{request.port}"
          if url.index("localhost")
            url = "#{url}/#/confirm_email/?confirmation_expired=true&name=#{first_name}"
          else
            url = "#{url}/app/#/confirm_email/?confirmation_expired=true&name=#{first_name}"
          end
          redirect_to url
        else
          render json: {
            success: false,
            errors: resource_errors,
          }, status: 422
        end
      else
        render json: {
          success: false,
          errors: resource_errors,
        }, status: 422
      end
    end

    protected

    def update_authentication_merged
      if resource_valid_and_confirmed?
        authentication = @resource.authentications.all.find_by(provider: 'email')
        @resource.update_timestamps_when_authentication_merged(authentication)
      end
    end

    def email_params
      params.require(:email)
    end

    def create_intercom_user_after_confirmation
      create_intercom_user_unless_created if resource_valid_and_confirmed?
    end

    def resource_valid_and_confirmed?
      @resource.errors.empty? && @resource.confirmed?
    end
  end
end

class ApplicationController < ActionController::Base
  include ApplicationHelper

  include DeviseTokenAuth::Concerns::SetUserByToken

  before_action :configure_permitted_parameters, if: :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) << :name
    devise_parameter_sanitizer.for(:sign_up) << :access_key
    devise_parameter_sanitizer.for(:account_update) << :image
  end

  def create_intercom_user_unless_created
    @resource.create_intercom_user unless @resource.intercom_user_created?
  end
end

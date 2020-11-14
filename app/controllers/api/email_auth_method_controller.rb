class Api::EmailAuthMethodController < ApplicationController

  # GET 'email_auth_method/?email=user_email_address'
  def index
    if params[:email]
      user = User.find_by(:email =>params[:email])
      if user && user[:provider]
        render :json => { :success => true, :auth_method => user[:provider] }, :status => 200
      else
        render :json => { :success => false, :error => "nope" }, :status => 400
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 400
    end
  end

end

class Api::EmailSignUpsController < ApplicationController
  def index
    @email_sign_ups = EmailSignUp.find(:all)
    render :json => { :success => true, :email_sign_ups => @email_sign_ups }
  end

  def create
    @email_sign_up = EmailSignUp.new(email_sign_up_params)
    if @email_sign_up.valid?
      @email_sign_up.save
      render :json => { :success => true, :email_sign_up => @email_sign_up }
    else
      render :json => { :success => false, :error => 'email already used' }, :status => 422
    end
  end

  private
    def email_sign_up_params
      params.require(:email_sign_up).permit(:name, :email)
    end
end

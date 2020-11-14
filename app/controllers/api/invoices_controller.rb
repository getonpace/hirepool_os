class Api::InvoicesController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :get_target_user

  def index
    if ((@user.is_admin? && @user.sponsor == "hirepool") || @user == @target_user)
      render json: { success: true, invoices: @target_user.invoices }
    else
      render json: { success: false, error: 'nope' }, status: 403
    end
  end

  private

  def get_current_user
    @user = current_user
  end

  def get_target_user
    @target_user = User.find(params[:user_id])
  end
end
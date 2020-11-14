class Api::CompaniesController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET /api/companies/:id
  def index
    @company = Company.find(params[:id])
    render :json => { :success => true, :company => @company }
  end

  # GET /api/companies/all
  def all
    if @user.is_admin && @user[:sponsor] == "hirepool"
      render :json => { :success => true, :companies => Company.all }, :status => 200
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  private
    def get_current_user
      @user = current_user
    end

end

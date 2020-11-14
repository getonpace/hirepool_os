class Api::OffersController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET 'offers/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("offers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("offers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND offers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND offers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("offers.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  def index
    @interview = @user.interviews.find_by(:id => params[:interview_id])
    if !@interview
     render :json => { :status => :not_found }
    else
      render :json => { :success => true, :experiences => @interview.offer }
    end
  end

  def update
    @interview = get_current_interview
    if @interview.offer
      if params[:offer]
        @interview.offer.update!(offer_params)

        render :json => { :success => true, :offer => @interview.offer }
      else
        render :json => { :success => false, :error => 'offer params required' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'offer does not exist' }, :status => 404
    end
  end

  def create
    @interview = get_current_interview
    if @interview.offer
      render :json => { :success => false, :error => 'offer already exists' }, :status => 403
    else
      if params[:offer]
        ActiveRecord::Base.transaction do
          @offer = Offer.create!(offer_params)
          @interview.offer = @offer
          @interview.save!
        end
        render :json => { :success => true, :offer => @offer }
      else
        render :json => { :success => false, :error => 'offer params required' }, :status => 403
      end
    end
  end

  def destroy
    @interview = @user.interviews.find_by(:id => params[:interview_id])
    if !@interview or !@interview.offer
     render :json => { :success => false, :error => 'offer does not exist' }, :status => 404
    else
      ActiveRecord::Base.transaction do
        @interview.offer.destroy
      end

      render :json => { :success => true, :interview => @interview }
    end
  end

  private
    def interview_params
      params.require(:interview).permit(:id, :user_id, :role, :location, :referrer_name, :referrer_email, :date, :source, :pinned, :archived, :job_title)
    end

    def offer_params
      params.require(:offer).permit(:id, :interview_id, :status, :offer_type, :base_salary, :total_target_compensation, :additional_compensation, :expiration_date)
    end

    def get_current_user
      @user = current_user
    end

    def get_current_interview
      @user.interviews.find_by(:id => interview_params[:id])
    end
end

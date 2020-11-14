class Api::UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :can_edit_user, only: :update

  # GET 'users/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :users => User.where(:is_test_account => [false, nil], :is_admin => [false, nil]).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :users => User.where("updated_at > ? AND (is_test_account = false OR is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :users => User.where("updated_at > ? AND (is_test_account = false OR is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => { :success => true, :users => User.where({:sponsor => @user[:sponsor], :user_agreement_status => ["accepted", "auto-accepted"], :is_test_account => [false, nil], :is_admin => [false, nil]}).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :users => User.where("sponsor = ? AND (user_agreement_status = 'accepted' || user_agreement_status = 'auto-accepted') AND updated_at > ? AND (is_test_account = false OR is_test_account IS NULL) AND (is_admin = false OR is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :users => User.where("sponsor = ? AND (user_agreement_status = 'accepted' || user_agreement_status = 'auto-accepted') AND updated_at > ? AND (is_test_account = false OR is_test_account IS NULL) AND (is_admin = false OR is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  # GET 'users/:id', to: 'users#index'
  def index
    if @user.is_admin && !(params[:id].nil?)
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :user => User.find_by(:id => params[:id]).as_json({:admin_data => true})}
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          render :json => { :success => true, :user => User.find_by(:id => params[:id]).as_json({:admin_data => true})}
        else
          render :json => { :success => false, :error => "nope" }, :status => 403
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  def update
    if @user.update_attributes(user_params)
      render json: { success: true, user: @user }
    else
      render json: { success: false }, status: 400
    end
  end

  # get 'users/profile', to: 'users#profile'
  def profile
    render :json => { :success => true, :user => @user }
  end

  #PUT 'users/need_ftu_opportunity_details'
  def need_ftu_opportunity_details
    if @user.update_attributes(need_ftu_opportunity_details: false)
      render json: {success: true, user: @user}
    else
      render json: {success: false}
    end
  end

  #PUT 'users/need_ftu_opportunity_details'
  def need_ftu_opportunities_index
    if @user.update_attributes(need_ftu_opportunities_index: false)
      render json: {success: true, user: @user}
    else
      render json: {success: false}
    end
  end

  #PUT 'users/never_show_survey_reminder'
  def never_show_survey_reminder
    @user.update_attributes(
      last_survey_reminder_date: DateTime.now,
      never_show_survey_reminder: true
    )
    render json: {success: true, user: @user}
  end

  #PUT 'users/set_survey_last_reminded_date'
  def set_survey_last_reminded_date
    @user.update_attributes(last_survey_reminder_date: DateTime.now)
    render json: {success: true, user: @user}
  end

  #PUT 'users/saw_welcome_screen'
  def saw_welcome_screen
    @user[:saw_welcome_screen] = true;
    @user.save
    render :json => {success: true, user: @user}
  end;

  #PUT 'users/saw_authentication_merged_message'
  def saw_authentication_merged_message
    if @user.touch(:authentication_merged_message_shown_at)
      render json: { success: true, user: @user }
    else
      render json: { success: false }, status: 403
    end
  end

  # put 'users/user_agreement/:user_agreement_status'
  def update_user_agreement
    if params[:user_agreement_status]
      # if a user has the "auto-accepted" user agreement state, it shouldn't be overwritten by "seen"
      unless params[:user_agreement_status] == "seen" && @user[:user_agreement_status] == "auto-accepted"
        @user[:user_agreement_status] = params[:user_agreement_status]
      end
      @user[:saw_user_agreement_at] = DateTime.now
      @user.save
      render :json => { :success => true, :user => @user }
    else
      render :json => { :success => false, :error => "bad params" }, :status => 400
    end
  end

  def saw_cerebro_invite
    @user[:saw_cerebro_invite] = true;
    @user.save
    @user.update_intercom_cerebro_data
    render :json => {success: true, user: @user}
  end

  def accept_cerebro_invite
    @user[:cerebro_opt_in] = true;
    @user.save
    @user.update_intercom_cerebro_data
    render :json => {success: true, user: @user}
  end

  private

  def get_current_user
    @user = current_user
  end

  def can_edit_user
    render json: { success: false, error: "unauthorized to edit user" }, status: 401 unless @user.id == params[:id].to_i
  end

  def user_params
    params.require(:user).permit(:name, :cerebro_opt_in)
  end

end

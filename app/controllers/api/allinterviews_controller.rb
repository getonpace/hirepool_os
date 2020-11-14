class Api::AllinterviewsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET /api/admin/users
  def users
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :users => User.where({:is_test_account => [false, nil], :is_admin => [false, nil]}).order("users.updated_at DESC") }, :status => 200
      elsif @user[:sponsor]
        render :json => { :success => true, :users => User.where({:sponsor => @user[:sponsor], :user_agreement_status => ["accepted", "auto-accepted"], :is_test_account => [false, nil], :is_admin => [false, nil]}).order("users.updated_at DESC") }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /api/admin/interviews
  def interviews
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :interviews => Interview.joins(:user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("interviews.updated_at DESC") }, :status => 200
      elsif @user[:sponsor]
        render :json => { :success => true, :interviews => Interview.joins(:user).where("users.sponsor = '#{@user[:sponsor]}' AND (users.user_agreement_status = 'accepted' OR users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("interviews.updated_at DESC") }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /api/admin/events
  def events
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :events => Event.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("events.updated_at DESC") }, :status => 200
      elsif @user[:sponsor]
        render :json => { :success => true, :events => Event.joins(:interview => [:user]).where("users.sponsor = '#{@user[:sponsor]}' AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("events.updated_at DESC") }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /api/admin/collaborations
  def collaborations
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("collaborator_feedbacks.updated_at DESC") }, :status => 200
      elsif @user[:sponsor]
        render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => [:user]).where("users.sponsor = '#{@user[:sponsor]}' AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("collaborator_feedbacks.updated_at DESC") }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /api/admin/offers
  def offers
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => { :success => true, :offers => Offer.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("offers.updated_at DESC") }, :status => 200
      elsif @user[:sponsor]
        render :json => { :success => true, :offers => Offer.joins(:interview => [:user]).where("users.sponsor = '#{@user[:sponsor]}' AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("offers.updated_at DESC") }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  private
    def get_current_user
      @user = current_user
    end

end

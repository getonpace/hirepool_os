class Api::UserActionsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  skip_before_action :authenticate_user!, :get_current_user, only: [:public_create]

  # GET /user_actions/recent/user/:id
  def user_recent
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => {
          :success => true,
          :user_actions => UserAction.where('created_at > ? AND user_id = ?', 3.minutes.ago, params[:id]),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          render :json => {
            :success => true,
            :user_actions => UserAction.where('created_at > ? AND user_id = ?', 3.minutes.ago, params[:id]),
            :actions => Action.all,
            :modals => Modal.all,
            :pages => Page.all,
            :sort_params => SortParam.all
          }, :status => 200
        else
          render :json => { :success => false, :error => 'nope' }, :status => 403
        end
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /user_actions/recent
  def recent
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => {
          :success => true,
          :user_actions => UserAction.joins(:user).where('user_actions.created_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)', 3.minutes.ago),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      elsif @user[:sponsor]
        render :json => {
          :success => true,
          :user_actions => UserAction.joins(:user).where("user_actions.created_at > ? AND users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 3.minutes.ago, @user[:sponsor]),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /user_actions/all/user/:id
  def user_all
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => {
          :success => true,
          :user_actions => UserAction.where('user_id = ?', params[:id]),
        }, :status => 200
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          render :json => {
            :success => true,
            :user_actions => UserAction.where('user_id = ?', params[:id]),
          }, :status => 200
        else
          render :json => { :success => false, :error => 'nope' }, :status => 403
        end
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /user_actions/user/:id
  def user_index
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => {
          :success => true,
          :user_actions => UserAction.where('user_id = ?', params[:id]).order('id DESC').limit(60),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          render :json => {
            :success => true,
            :user_actions => UserAction.where('user_id = ?', params[:id]).order('id DESC').limit(60),
            :actions => Action.all,
            :modals => Modal.all,
            :pages => Page.all,
            :sort_params => SortParam.all
          }, :status => 200
        else
          render :json => { :success => false, :error => 'nope' }, :status => 403
        end
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /user_actions
  def index
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        render :json => {
          :success => true,
          :user_actions => UserAction.joins(:user).where('(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)').order('user_actions.id DESC').limit(60),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      elsif @user[:sponsor]
        render :json => {
          :success => true,
          :user_actions => UserAction.joins(:user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL) AND users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted')", @user[:sponsor]).order('user_actions.id DESC').limit(60),
          :actions => Action.all,
          :modals => Modal.all,
          :pages => Page.all,
          :sort_params => SortParam.all
        }, :status => 200
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /user_actions/:id
  def show
  end

  # POST /user_actions/public
  def public_create
    @user_action_params = user_action_params
    if ok_for_public
      @action = Action.find_by(:name => @user_action_params[:action])
      if (!@action)
        @action = Action.create({:name => @user_action_params[:action]})
      end
      @page = Page.find_by(:name => @user_action_params[:page])
      if (!@page)
        @page = Page.create({:name => @user_action_params[:page]})
      end
      @user_action = UserAction.create!({ :action_id => @action.id, :page_id => @page.id })
      render :json => { :success => true }
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # POST /user_actions
  def create
    @user_action_params = user_action_params
    if @user_action_params[:action]
      ActiveRecord::Base.transaction do
        @action = Action.find_by(:name => @user_action_params[:action])
        if (!@action)
          @action = Action.create({:name => @user_action_params[:action]})
        end
        @user_action_params_to_save = { :action_id => @action.id, :user_id => @user.id }
        if @user_action_params[:page]
          @page = Page.find_by(:name => @user_action_params[:page])
          if (!@page)
            @page = Page.create({:name => @user_action_params[:page]})
          end
          @user_action_params_to_save[:page_id] = @page.id
        end
        if @user_action_params[:modal]
          @modal = Modal.find_by(:name => @user_action_params[:modal])
          if (!@modal)
            @modal = Modal.create({:name => @user_action_params[:modal]})
          end
          @user_action_params_to_save[:modal_id] = @modal.id
        end
        if @user_action_params[:sort_param]
          @sort_param = SortParam.find_by(:name => @user_action_params[:sort_param])
          if (!@sort_param)
            @sort_param = SortParam.create({:name => @user_action_params[:sort_param]})
          end
          @user_action_params_to_save[:sort_param_id] = @sort_param.id
        end
        if @user_action_params[:event_id]
          @user_action_params_to_save[:event_id] = @user_action_params[:event_id]
        end
        @user_action = UserAction.create!(@user_action_params_to_save)
        if (@user_action_params[:interviews])
          @user_action_params[:interviews].each { |interview|
            UserActionsInterview.create!({ :user_action_id => @user_action.id, :interview_id => interview })
          }
        end
      end
      render :json => { :success => true }
    end
  end

  private
    def user_action_params
      params.require(:user_action).permit(:action, :modal, :page, :sort_param, :event_id, :interviews => [])
    end

    def get_current_user
      @user = current_user
    end

    def ok_for_public
      action_ok_for_public && page_ok_for_public
    end

    def page_ok_for_public
      page = @user_action_params[:page]
      page && (page.include?("signup") || page.include?("landing-page-version"))
    end

    def action_ok_for_public
      action = @user_action_params[:action]
      action && (action == "load-page" || action.include?("create_account") || action.include?("goto-signup-from-landing-page"))
    end

end

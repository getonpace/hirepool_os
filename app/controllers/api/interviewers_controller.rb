class Api::InterviewersController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET 'interviewers/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("interviewers.created_at DESC").as_json({:overview_interaction_interviewer => true}),
          }, :status => 200
        elsif params[:days]
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("interviewers.created_at DESC").as_json({:overview_interaction_interviewer => true})
          }, :status => 200
        else
          # default 30 days
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true})
          }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("interviewers.created_at DESC").as_json({:overview_interaction_interviewer => true}),
          }, :status => 200
        elsif params[:days]
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("interviewers.created_at DESC").as_json({:overview_interaction_interviewer => true})
          }, :status => 200
        else
          # default 30 days
          render :json => {
            :success => true,
            :event_interviewers => Interviewer.joins(:events => [{:interview => :user}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true}),
            :interaction_interviewers => Interviewer.joins(:interactions => [{:event => [{:interview => :user}]}]).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND interviewers.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("interviewers.created_at DESC").as_json({:overview_event_interviewer => true})
          }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end



  private

    def get_current_user
      @user = current_user
    end

end

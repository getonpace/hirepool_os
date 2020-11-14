class Api::CollaboratorFeedbackController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET 'collaborator_feedback/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("collaborator_feedbacks.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("collaborator_feedbacks.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND collaborator_feedbacks.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :collaborations => CollaboratorFeedback.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND collaborator_feedbacks.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("collaborator_feedbacks.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  def create
    @interview = get_current_interview

    ActiveRecord::Base.transaction do
      if params[:collaborator]
        @collaborator = Collaborator.find_by(:name => collaborator_params[:name], :email => collaborator_params[:email])

        if @collaborator
          @interview.collaborators << @collaborator
        else
          @collaborator = Collaborator.create!(collaborator_params)
          @interview.collaborators << @collaborator
        end
      end
      @interview.save!

      @collaboratorFeedback = CollaboratorFeedback.find_by(:interview_id => @interview[:id], :collaborator_id => @collaborator[:id])

      if @collaboratorFeedback
        @collaboratorFeedback.update!(:token => generate_new_key, :date_asked => Time.now)
      end
    end

    @email_url = "#{request.protocol}#{request.host}:#{request.port}"
    @email_url += '/api/provide_feedback/'
    @email_url += '?token='
    @email_url += @collaboratorFeedback[:token].to_s

    UserCollaboratorMailer.request_email(@user, @collaborator, @collaboratorFeedback, @email_url, @collaboratorFeedback.interview.company.name, @collaboratorFeedback.interview.job_title).deliver_later

    render :json => { :success => true, :collaborator_feedback => @collaboratorFeedback }
  end

  private
    def generate_new_key
      ('a'..'z').to_a.shuffle.first(25).join
    end

    def interview_params
      params.require(:interview).permit(:id)
    end

    def get_current_interview
      @user.interviews.find_by(:id => interview_params[:id])
    end

    def collaborator_params
      params.require(:collaborator).permit(:id, :name, :email)
    end

    def collaborator_feedback_params
      params.require(:collaborator_feedback).permit(:id, :interview_id, :collaborator_id, :feedback, :rating, :token, :date_asked, :date_completed)
    end

    def url_params
      params.require(:url).permit(:url)
    end

    def get_current_user
      @user = current_user
    end
end

class Api::ProvideFeedbackController < ApplicationController
  def index
    @collaboratorFeedback = CollaboratorFeedback.find_by(:token => params[:token])
    @url = "#{request.protocol}#{request.host}:#{request.port}"
    if @url.index("localhost")
      @url += "/#/provide_feedback/"
    else
      @url += "/app/#/provide_feedback/"
    end

    if @collaboratorFeedback
      @url += @collaboratorFeedback[:id].to_s
      @url += "/"
      @url += @collaboratorFeedback[:token].to_s
      redirect_to @url
    else
      @url += "previously_completed"
      redirect_to @url
    end
  end

  def show
    @collaboratorFeedback = CollaboratorFeedback.find_by(:token => params[:token], :id => params[:id])
    if @collaboratorFeedback
      render :json => { :success => true, :collab_interview => @collaboratorFeedback.interview, :user_name => @collaboratorFeedback.interview.user.name, :collab_name => @collaboratorFeedback.collaborator.name }
    else
      @url = "#{request.protocol}#{request.host}:#{request.port}"
      if @url.index("localhost")
        @url += "/#/provide_feedback/previously_completed"
      else
        @url += "/app/#/provide_feedback/previously_completed"
      end
      redirect_to @url
    end
  end

  def update
    @collaboratorFeedback = CollaboratorFeedback.find_by(:token => params[:token][:token])
    if @collaboratorFeedback
      @collaboratorFeedback.update!(:rating => params[:collaborator_feedback][:rating], :feedback => params[:collaborator_feedback][:feedback], :date_completed => Time.now, :token => "")
      @collaborator = @collaboratorFeedback.collaborator
      @interview = @collaboratorFeedback.interview
      @company = @collaboratorFeedback.interview.company
      @user = @collaboratorFeedback.interview.user
      @url = request.protocol + request.host;
      if request.port
        @url += ":" + request.port.to_s
      end
      CollaboratorRespondedMailer.notification_email(@user, @company, @interview, @collaborator, @url).deliver_later
      render :json => { :success => true }
    else
      render :json => { :success => false, :error => 'token not found' }, :status => 404
    end
  end
end

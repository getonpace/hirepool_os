class Api::FeedbackController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  def index
    @interview = @user.interviews.find_by(:id => params[:interview_id])
    if !@interview
     render :json => { :status => :not_found }
    else
      render :json => { :success => true, :experiences => @interview.interviews_interviewers }
    end
  end

  def create
    @interview = get_current_interview
    ActiveRecord::Base.transaction do
      if params[:interviewer]
        if params[:interviewer][:name] && params[:interviewer][:email]
          @interviewer = Interviewer.find_by(:name => params[:interviewer][:name], :email => params[:interviewer][:email])
        end

        if @interviewer
          @interview.interviewers << @interviewer
        else
          @interviewer = Interviewer.create!(get_interviewer_hash(params[:interviewer]))
          @interview.interviewers << @interviewer
        end
      end
      @interview.save!

      if params[:experience]
        @experience = InterviewsInterviewer.where(:interviewer_id => @interviewer[:id], :interview_id => @interview[:id]).endmost(1).take
        if @experience
          @experience.update!(experience_params)
        end
      end
    end

    render :json => { :success => true, :experience => @experience }
  end

  def update
    @experience = get_current_experience
    if !@experience
     render :json => { :status => :not_found }
    else
      ActiveRecord::Base.transaction do
        @experience.update!(experience_params)
        @interviewer = Interviewer.find_by(:id => params[:interviewer][:id])
        if @interviewer
          @interviewer.update!(get_interviewer_hash(params[:interviewer]))
        end
      end

      render :json => { :success => true, :experience => @experience }
    end
  end

  def destroy
    @interview = @user.interviews.find_by(:id => params[:interview_id])
    if @interview
      @experience = @interview.interviews_interviewers.find_by(:interview_id => params[:interview_id], :id => params[:id])
      if !@experience
       render :json => { :status => :not_found }
      else
        @experience.destroy!
        render :json => { :success => true }
      end
    else
      render :json => { :status => :not_found }
    end
  end

  private
    def interview_params
      params.require(:interview).permit(:id)
    end

    def get_interviewer_hash(interviewer_params)
      interviewer_hash = interviewer_params.slice(:id, :name, :email, :role, :gender).reject { |k, v| v.nil? }.symbolize_keys
    end

    def experience_params
      params.require(:experience).permit(:id, :interviewer_id, :interview_id, :style, :date, :relationship, :timeliness, :preparation, :difficulty, :experience_score, :culture_val, :location, :interviewer_score, :company_preparation, :excited, :notes, :duration_minutes, :role_match, :one_word)
    end

    def get_current_user
      @user = current_user
    end

    def get_current_experience
      interview = get_current_interview
      interview.interviews_interviewers.find_by(:id => params[:id])
    end

    def get_current_interview
      @user.interviews.find_by(:id => interview_params[:id])
    end
end

class Api::ResumesController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :get_target_user

  def index
    if ((@user.is_admin? && @user.sponsor == "hirepool") || @user == @target_user)
      render json: { success: true, resumes: @target_user.resumes }
    else
      render json: { success: false, error: 'nope' }, status: 403
    end
  end

  def upload_resume
    if params[:resume_file]
      @resume_file = params[:resume_file]
      @resume = @user.resumes.new
      @resume.original_filename = @resume_file.original_filename
      filename_parts = @resume_file.original_filename.split('.')
      filename_parts.shift
      @resume_file.original_filename = "resume#{@user.id}_#{Time.now.to_i}.#{filename_parts.join('.')}"
      @resume.resume_file = params[:resume_file]
      if @resume.save
        render json: { success: true }
      else
        render json: { success: false, error: "error saving resume" }
      end
    else
      render :json => { :success => false, :error => "bad params" }, :status => 400
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
require 'aws-sdk'

class Api::PremiumSurveysController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :admin_user_only, only: :user_index

  # GET /premium_surveys/user/:id
  def user_index
    if @user[:sponsor] == "hirepool"
      survey = PremiumSurvey.new({})
      item = survey.load(params[:id].to_i)
      render :status => 200, :json => {:survey => item}
    elsif @user[:sponsor]
      user = User.find_by({:id => params[:id]})
      if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
        survey = PremiumSurvey.new({})
        item = survey.load(params[:id].to_i)
        render :status => 200, :json => {:survey => item}
      else
        render :json => { :success => false, :error => 'nope' }, :status => 403
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET /premium_surveys
  def index
    queryOptions = {
      :user_id => current_user.id
    }
    survey = PremiumSurvey.new({})
    item = survey.load(current_user.id)
    render :status => 200, :json => {:survey => item}
  end

  # POST /premium_surveys
  def create
    @params = params[:_json]

    dynamoItem = {
      :user_id => current_user.id,
      :datetime => Time.now.utc.iso8601,
      :answers => @params.clone.delete_if {|item| item.has_key?('user')}
    }

    survey = PremiumSurvey.new(dynamoItem)
    if survey.save
      render :status => 200, :json => {:status => "OK"}
    else
      render :status => 500, :json => {:error => "failed to save"}
    end
  end

  private

    def admin_user_only
      render json: { success: false, error: 'nope' }, status: 403 unless @user.is_admin
    end

    def get_current_user
      @user = current_user
    end

end

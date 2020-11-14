require 'aws-sdk'

class Api::SurveysController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET /surveys/user/:id
  def user_index
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        survey = Survey.new({})
        item = survey.load(params[:id].to_i)
        render :status => 200, :json => {:survey => item}
      elsif @user[:sponsor]
        user = User.find_by({:id => params[:id]})
        if user[:sponsor] == @user[:sponsor] && (user[:user_agreement_status] == "accepted" || user[:user_agreement_status] == "auto-accepted")
          survey = Survey.new({})
          item = survey.load(params[:id].to_i)
          render :status => 200, :json => {:survey => item}
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

  # GET /surveys
  def index
    queryOptions = {
      :user_id => current_user.id
    }
    survey = Survey.new({})
    item = survey.load(current_user.id)
    render :status => 200, :json => {:survey => item}
  end

  # POST /surveys
  def create
    @params = params[:_json]

    dynamoItem = {
      :user_id => current_user.id,
      :datetime => Time.now.utc.iso8601,
      :answers => @params.clone.delete_if {|item| item.has_key?('user')}
    }

    survey = Survey.new(dynamoItem)
    if survey.save
      render :status => 200, :json => {:status => "OK"}
    else
      render :status => 500, :json => {:error => "failed to save"}
    end

  end

  # PUT /surveys
  def update
  end

  private

    def get_current_user
      @user = current_user
    end

end

require 'aws-sdk'

class Api::CompanyAutocompleteController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  LAMBDA_FUNCTION_NAME = Rails.configuration.x.lambda.interview_reviews_job

  def index
    response = HTTP.get('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + URI.encode(params[:query]))

    if response.code != 200
      render :json => { :success => false, :error => 'failed companies request' }, :status => 400
    else
      render :status => 200, :json => JSON.parse(response.body)
    end
  end

  def details
    response = Company.get_details(params[:domain])

    if !response.nil? and response.successful?
      render :status => 200, :json => response.item
    else
      render :status => 404, :json => {}
    end
  end

  def all_details
    if @user.is_admin && @user[:sponsor] == "hirepool"
      results = Company.get_all_details
      if !results.nil? and results.length > 0
        render :status => 200, :json => results
      else
        render :status => 404, :json => {}
      end
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  def ratings
    if request.env["HTTP_X_FORWARDED_FOR"].is_a? String
      ip = request.env["HTTP_X_FORWARDED_FOR"]
    else
      ip = request.remote_ip
    end
    ua = request.env["HTTP_USER_AGENT"]
    response = Company.get_ratings(params[:domain], params[:name], ip, ua)

    if !response.nil? and response.successful?
      company = Company.find_by(domain: params[:domain])
      if response.item["company_ratings"].class == Hash && company.glassdoor_id != response.item["company_ratings"]["id"].floor.to_s
        company.glassdoor_id = response.item["company_ratings"]["id"].floor
        company.save
        lambda = Aws::Lambda::Client.new(
          region: 'us-west-2'
        )
        if LAMBDA_FUNCTION_NAME != "null"
          resp = lambda.invoke(function_name: LAMBDA_FUNCTION_NAME)
          puts "invoked lamba function #{LAMBDA_FUNCTION_NAME}"
        end
      end
      render :status => 200, :json => response.item
    else
      render :status => 404, :json => {}
    end
  end

  def all_ratings
    if @user.is_admin && @user[:sponsor] == "hirepool"
      results = Company.get_all_ratings
      if !results.nil? and results.length > 0
        render :status => 200, :json => results
      else
        render :status => 404, :json => {}
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

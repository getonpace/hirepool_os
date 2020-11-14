require 'aws-sdk'

class Api::FaqQuestionsController < ApplicationController
  before_action :authenticate_user!

  # GET /faq_questions
  def index
  end

  # POST /faq_questions
  def create
    dynamoItem = {
      :user_id => current_user.id,
      :datetime => Time.now.utc.iso8601,
      :question => params["question"],
      :useful => params["useful"]
    }

    faq_question = FaqQuestion.new(dynamoItem)
    if faq_question.save
      render :status => 200, :json => {:status => "OK"}
    else
      render :status => 500, :json => {:error => "failed to save"}
    end

  end

  # PUT /faq_questions
  def update
  end

end

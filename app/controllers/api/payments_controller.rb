class Api::PaymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :get_target_user

  require "stripe"

  Stripe.api_key = ENV['STRIPE_API_KEY']

  # POST /api/payments
  def create
    token = params[:stripeToken]

    ActiveRecord::Base.transaction do
      @payment = Payment.new
      @payment.user = @user
      @payment[:amount] = @user.get_amount
      @payment[:token] = token
      @payment[:attempted_at] = DateTime.now
      @payment.save!
    end

    description = 'hirepool monthly subscription'
    if @user.get_payment_period == 'year'
      description = 'hirepool annual subscription'
    end

    charge = Stripe::Charge.create({
        amount: @user.get_amount,
        currency: 'usd',
        description: description,
        source: token,
    })

    ActiveRecord::Base.transaction do
      @payment[:completed_at] = DateTime.now
      @payment[:status] = charge.status
      @payment[:payment_hash] = charge.to_s
      @payment.save!
    end

    @user.update_intercom_user_payments

    if charge.status == 'succeeded'
      render :json => { :success => true, :data => {:payment => @payment.as_json} }, :status => 200
    else
      render :json => { :success => false, :error => 'nope' }, :status => 403
    end
  end

  # GET 'payments/user/:id'
  def user_index
    if @user.is_admin && @user[:sponsor] == "hirepool"
      render :json => { :success => true, :payments => User.find_by_id(params[:id]).payments.as_json }
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  # GET 'payments/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :payments => Payment.joins(:user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("payments.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :payments => Payment.joins(:user).where("payments.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("payments.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :payments => Payment.joins(:user).where("payments.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("payments.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  # GET 'users/:id/payments'
  def index
    if ((@user.is_admin? && @user.sponsor == "hirepool") || @user == @target_user)
      render json: { success: true, payments: @target_user.payments.as_json({limited_data: true}) }
    else
      render json: { success: false, error: 'nope' }, status: 403
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

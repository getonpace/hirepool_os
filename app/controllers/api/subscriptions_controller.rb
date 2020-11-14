class Api::SubscriptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user
  before_action :get_target_user
  before_action :get_subscription, only: [:destroy]

  require "stripe"

  Stripe.api_key = ENV['STRIPE_API_KEY']

  def index
    if ((@user.is_admin? && @user.sponsor == "hirepool") || @user == @target_user)
      render json: { success: true, subscriptions: @target_user.subscriptions }
    else
      render json: { success: false, error: 'nope' }, status: 403
    end
  end

  def create
    if @target_user.stripe_customer_id.nil?
      token = params[:stripeToken]
      customer = Stripe::Customer.create(
        description: "Customer for #{@target_user.email}",
        email: @target_user.email,
        source: token
      )
      @target_user.update_attributes!(stripe_customer_id: customer.id)
    end

    if @target_user.payments_group == "1.0.2"
      plan = ENV['STRIPE_5_MONTHLY_PLAN']
    elsif @target_user.payments_group == "1.0.3"
      plan = ENV['STRIPE_20_MONTHLY_PLAN']
    else
      plan = "cerebro_0"
    end

    unless plan == "cerebro_0"
      stripe_subscription = Stripe::Subscription.create(
        customer: @target_user.stripe_customer_id,
        items: [
          {
            plan: plan
          }
        ]
      )
      subscription = @target_user.subscriptions.create(stripe_subscription_id: stripe_subscription.id, plan: plan)
    end

    subscription_data = plan == "cerebro_0" ? "free" : subscription.as_json
    render json: { success: true, subscription: subscription_data }, status: 200
  end

  def update_payment_details
    unless @target_user.stripe_customer_id.nil?
      customer = Stripe::Customer.retrieve(@target_user.stripe_customer_id)
      customer.source = params[:stripeToken]
      customer.save
      render json: { success: true, card: get_card(customer) }, status: 200
    else
      render json: { success: false, error: "bad params" }, status: 400
    end
  end

  def payment_details
    unless @target_user.stripe_customer_id.nil?
      customer = Stripe::Customer.retrieve(@target_user.stripe_customer_id)
      # we only accept card, and only keep one source on record at any time - here we assume that the first source is the current source and is a card
      card = get_card(customer)
      if card
        render json: { success: true, card: card }, status: 200
      else
        render json: { success: false, error: "error" }, status: 400
      end
    else
      render json: { success: false, error: "bad params" }, status: 400
    end
  end

  def destroy
    stripe_subscription = Stripe::Subscription.retrieve(@subscription.stripe_subscription_id)
    stripe_subscription.delete
    @subscription.active = false
    @subscription.end_date = Time.now
    @subscription.save!
    render json: { success: true }, status: 200
  end

  private

  def get_card (customer)
    card = customer.sources["data"][0]
    { last4: card["last4"], exp_month: card["exp_month"], exp_year: card["exp_year"], brand: card["brand"] }
  end

  def get_current_user
    @user = current_user
  end

  def get_target_user
    @target_user = User.find(params[:user_id])
  end

  def get_subscription
    @subscription = @target_user.subscriptions.find(params[:id])
  end
end
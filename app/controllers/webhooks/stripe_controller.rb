class Webhooks::StripeController < ApplicationController
  skip_before_action :verify_authenticity_token

  def webhook
    event_object = params[:data][:object]
    @subscription_activity = SubscriptionActivity.new
    @subscription_activity.user = User.find_by_stripe_customer_id(event_object[:customer])
    @subscription_activity.activity_type = params[:type]
    @subscription_activity.webhook_payload = params.to_s
    successful_save = @subscription_activity.save!

    if event_object[:object] && event_object[:object] == "subscription"
      @subscription = Subscription.find_or_create_by(stripe_subscription_id: event_object[:id])
      @subscription.next_charge_at = Time.at(event_object[:current_period_end]).to_datetime
      @subscription.save!
    end

    if event_object[:object] && event_object[:object] == "invoice" && event_object[:id]
      @invoice = Invoice.find_or_create_by(stripe_invoice_id: event_object[:id])
      @invoice.stripe_status = event_object[:status]
      @invoice.amount = event_object[:total]
      @invoice.subscription = Subscription.find_by(stripe_subscription_id: event_object[:subscription])
      @invoice.save!
    end

    if successful_save
      render json: {}, status: :ok
    else
      render json: {}, status: :not_modified
    end
  end
end
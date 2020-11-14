module AWS
  module SQS
    class HirepoolInterface
      def initialize
        @sqs = Aws::SQS::Client.new(region: 'us-west-2')
        @queue_url = @sqs.get_queue_url(queue_name: ENV['CREATE_INTERCOM_USERS_QUEUE']).queue_url
      end

      def create_intercom_user(user)
        send_sqs_message("Create intercom user for user #{user.id}", user_payload(user))
      end

      def update_cerebro_data(user)
        send_sqs_message("Update cerebro data for user #{user.id}", update_cerebro_payload(user))
      end

      def update_intercom_user_payments(user)
        send_sqs_message("Update intercom user with payments for user #{user.id}", user_payments_payload(user))
      end

      private

      def send_sqs_message(message_body, message_attributes)
        @sqs.send_message({
          queue_url: @queue_url,
          message_body: message_body,
          message_attributes: message_attributes
        })
      end

      def user_payments_payload(user)
        attributes = {
          "email" => {
            string_value: user.email,
            data_type: "String"
          },
          "name" => {
            string_value: user.name,
            data_type: "String"
          },
          "hirepool_id" => {
            string_value: user.id.to_s,
            data_type: "String"
          },
          "days_active" => {
            string_value: user.days_active.to_s,
            data_type: "String"
          },
          "payments_last_paid_at" => {
            string_value: user.payments_last_paid_at.to_s,
            data_type: "String"
          },
          "payments_last_paid_amount" => {
            string_value: user.payments_last_paid_amount.to_s,
            data_type: "String"
          },
          "payments_subscription_renewal_date" => {
            string_value: user.payments_subscription_renewal_date.to_s,
            data_type: "String"
          },
          "payments_total_paid_amount" => {
            string_value: user.payments_total_paid_amount.to_s,
            data_type: "String"
          },
          "payments_total_payments_made" => {
            string_value: user.payments_total_payments_made.to_s,
            data_type: "String"
          },
          "payments_amount" => {
            string_value: user.get_amount.to_s,
            data_type: "String"
          }
        }
        attributes.delete_if { |key, value| value[:string_value].nil? || value[:string_value].empty? }
        attributes.with_indifferent_access
      end

      def user_payload(user)
        attributes = {
          "email" => {
            string_value: user.email,
            data_type: "String"
          },
          "name" => {
            string_value: user.name,
            data_type: "String"
          },
          "hirepool_id" => {
            string_value: user.id.to_s,
            data_type: "String"
          },
          "welcome_email_sent_at" => {
            string_value: user.welcome_email_sent_at.to_s,
            data_type: "String"
          },
          "sponsor" => {
            string_value: user.sponsor,
            data_type: "String"
          },
          "intercom_messaging_version" => {
            string_value: user.intercom_messaging_version,
            data_type: "String"
          },
          "created_at" => {
            string_value: user.created_at.to_s,
            data_type: "String"
          },
          "payments_amount" => {
            string_value: user.get_amount.to_s,
            data_type: "String"
          }
        }
        attributes.delete_if { |key, value| value[:string_value].nil? || value[:string_value].empty? }

        if user.access_group.present?
          attributes["access_group"] = {
            string_value: user.access_group.key,
            data_type: "String"
          }
        end

        if user.user_tracking_tags.present?
          attributes["user_tracking_tags"] = {
            string_value: user.user_tracking_tags.pluck(:tag).join(","),
            data_type: "String"
          }
        end

        attributes.with_indifferent_access
      end

      def update_cerebro_payload(user)
        attributes = {
          "email" => {
            string_value: user.email,
            data_type: "String"
          },
          "name" => {
            string_value: user.name,
            data_type: "String"
          },
          "hirepool_id" => {
            string_value: user.id.to_s,
            data_type: "String"
          },
          "cerebro_opt_in" => {
            string_value: user.cerebro_opt_in.to_s,
            data_type: "String"
          },
          "saw_cerebro_invite" => {
            string_value: user.saw_cerebro_invite.to_s,
            data_type: "String"
          }
        }
        attributes.delete_if { |key, value| value[:string_value].nil? || value[:string_value].empty? }
        attributes.with_indifferent_access
      end
    end
  end
end
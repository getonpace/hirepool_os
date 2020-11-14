require 'rails_helper'
require 'aws/sqs/hirepool_interface'

RSpec.describe AWS::SQS::HirepoolInterface do
  describe 'initialize' do
    it "should set the sqs object with the correct region and get the queue url" do
      sqs = instance_double(Aws::SQS::Client)
      sqs_client = class_double(Aws::SQS::Client).as_stubbed_const
      expect(sqs_client).to receive(:new).with(region: 'us-west-2').and_return(sqs)
      expect(sqs).to receive(:get_queue_url).and_return(double({ queue_url: "queue_url" }))
      hirepool_interface = AWS::SQS::HirepoolInterface.new
    end
  end

  describe '#create_intercom_user' do
    let! (:sqs)  { instance_double(Aws::SQS::Client) }
    let! (:user) { instance_double(User, id: 1, name: "Chuck Person", email: "chuck@person.com", welcome_email_sent_at: "today", sponsor: "sponsor", get_amount: 5, created_at: "yesterday", access_group: nil, user_tracking_tags: nil, intercom_messaging_version: "3.0") }

    let! (:hirepool_interface) do
      sqs_client = class_double(Aws::SQS::Client).as_stubbed_const
      expect(sqs_client).to receive(:new).and_return(sqs)
      allow(ENV).to receive(:[]).with('CREATE_INTERCOM_USERS_QUEUE').and_return("sqs_queue")
      expect(sqs).to receive(:get_queue_url).with(queue_name: "sqs_queue").and_return(double("url", queue_url: "create_intercom_workers_queue_url"))
      AWS::SQS::HirepoolInterface.new
    end

    it "should send a message to the create_intercom_workers_queue with the correct attributes" do
      expect(hirepool_interface).to receive(:send_sqs_message).with("Create intercom user for user 1", {
        "email" => {
          string_value: "chuck@person.com",
          data_type: "String"
        },
        "name" => {
          string_value: "Chuck Person",
          data_type: "String"
        },
        "hirepool_id" => {
          string_value: "1",
          data_type: "String"
        },
        "welcome_email_sent_at" => {
          string_value: "today",
          data_type: "String"
        },
        "sponsor" => {
          string_value: "sponsor",
          data_type: "String"
        },
        "intercom_messaging_version" => {
          string_value: "3.0",
          data_type: "String"
        },
        "created_at" => {
          string_value: "yesterday",
          data_type: "String"
        },
        "payments_amount" => {
          string_value: "5",
          data_type: "String"
        }
      })
      hirepool_interface.create_intercom_user(user)
    end

    it "should not send nil or empty attributes in the message attributes" do
      user = instance_double(User, id: 1, name: "Chuck Person", email: "chuck@person.com", welcome_email_sent_at: nil, sponsor: "sponsor", get_amount: 5, days_active: 20, user_actions_count: 1000, created_at: "yesterday", access_group: nil, user_tracking_tags: nil, intercom_messaging_version: "3.0")
      expect(hirepool_interface).to receive(:send_sqs_message).with("Create intercom user for user 1", {
        "email" => {
          string_value: "chuck@person.com",
          data_type: "String"
        },
        "name" => {
          string_value: "Chuck Person",
          data_type: "String"
        },
        "hirepool_id" => {
          string_value: "1",
          data_type: "String"
        },
        "sponsor" => {
          string_value: "sponsor",
          data_type: "String"
        },
        "intercom_messaging_version" => {
          string_value: "3.0",
          data_type: "String"
        },
        "created_at" => {
          string_value: "yesterday",
          data_type: "String"
        },
        "payments_amount" => {
          string_value: "5",
          data_type: "String"
        }
      })
      hirepool_interface.create_intercom_user(user)
    end
  end

  describe '#update_cerebro_data' do
    let! (:sqs)  { instance_double(Aws::SQS::Client) }
    let! (:user) { instance_double(User, id: 1, name: "Chuck Person", email: "chuck@person.com", cerebro_opt_in: true, saw_cerebro_invite: true) }

    let! (:hirepool_interface) do
      sqs_client = class_double(Aws::SQS::Client).as_stubbed_const
      expect(sqs_client).to receive(:new).and_return(sqs)
      allow(ENV).to receive(:[]).with('CREATE_INTERCOM_USERS_QUEUE').and_return("sqs_queue")
      expect(sqs).to receive(:get_queue_url).with(queue_name: "sqs_queue").and_return(double("url", queue_url: "create_intercom_workers_queue_url"))
      AWS::SQS::HirepoolInterface.new
    end

    it "should send a message to the create_intercom_workers_queue with the correct attributes" do
      expect(hirepool_interface).to receive(:send_sqs_message).with("Update cerebro data for user 1", {
        "email" => {
          string_value: "chuck@person.com",
          data_type: "String"
        },
        "name" => {
          string_value: "Chuck Person",
          data_type: "String"
        },
        "cerebro_opt_in" => {
          string_value: "true",
          data_type: "String"
        },
        "saw_cerebro_invite" => {
          string_value: "true",
          data_type: "String"
        }
      })
      hirepool_interface.update_cerebro_data(user)
    end
  end
end
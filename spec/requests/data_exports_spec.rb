# frozen_string_literal: true

require 'rails_helper'

RSpec.shared_examples 'it serializes data to a CSV file' do |named:|
  #
  # Shared Setup
  #
  # Default resource_name is the exported CSV filename without the extension.
  let(:resource_name) { named.chomp('.csv') }

  # Default file export request path is the '/api/user_data/' + resource_name.
  let(:csv_file_request_path) { "/api/user_data/#{resource_name}" }

  # Determine the CsvSerializer class from the resource_name.
  let(:serializer_class) { "#{resource_name.camelize}CsvSerializer".constantize }

  # Get default titlized_attributes from the CsvSerializer class.
  let(:titleized_attributes) { serializer_class.titleized_attributes.join(',') }

  # Default collection of serializable resources are in the lazy-evaluated resource_name.
  let(:serializable_resources) { send(resource_name) }

  # Test the CSV response body
  subject(:csv) do
    Hash[].tap { |csv| csv[:headers], *csv[:rows] = response.body.split("\n") }
  end

  #
  # Shared Expectations
  #
  it 'responds successfully' do
    perform_request
    expect(response).to have_http_status(:success)
  end

  it 'responds with a CSV content type' do
    perform_request
    expect(response.content_type).to eq('text/csv')
  end

  it "responds with a file named '#{named}'" do
    perform_request
    expect(response).to have_disposition('attachment').with(filename: named)
  end

  it 'sets the csv headers from the serialized attribute names' do
    perform_request
    expect(csv[:headers]).to eq(titleized_attributes)
  end

  it 'has csv rows for every resource in the collection' do
    perform_request
    expect(csv[:rows].size).to eq(serializable_resources.size)
  end
end

RSpec.describe 'Exporting data to CSV', type: :request do
  #
  # Setup model data to serialize
  #
  let(:user) { FactoryGirl.create(:user, :random, :confirmed, :from_email_signup) }
  let!(:interviews) { FactoryGirl.create_list(:interview, 10, :with_offers, user: user) }

  let!(:collaborations) do
    interviews.flat_map do |interview|
      FactoryGirl.create(:collaboration, interview: interview)
    end
  end

  let!(:events) do
    interviews.flat_map do |interview|
      FactoryGirl.create(:event, interview: interview)
    end
  end

  let!(:event_feedback) do
    events.flat_map do |event|
      FactoryGirl.create(:event_feedback, :with_interviewer, event: event)
    end
  end

  let!(:interactions) do
    events.flat_map do |event|
      FactoryGirl.create(:interaction, event: event)
    end
  end

  let!(:interaction_feedback) do
    interactions.flat_map do |interaction|
      FactoryGirl.create(:interaction_feedback, :with_interviewer, interaction: interaction)
    end
  end

  #
  # Request Setup
  #
  let(:valid_params) { {} }
  let(:auth_token_headers) { user.create_new_auth_token }
  let(:accept_content_headers) { {'ACCEPT' => 'text/csv'} }
  let(:valid_headers) do
    [auth_token_headers, accept_content_headers].reduce({}, &:merge)
  end

  # As a convention, this subject is called inside the shared examples
  subject(:perform_request) do
    get csv_file_request_path, valid_params, valid_headers
  end

  describe 'GET /api/user_data/opportunitites' do
    it_behaves_like 'it serializes data to a CSV file', named: 'opportunities.csv' do
      let(:serializable_resources) { interviews }

      it 'has verified resources to serialize' do
        expect(user.interviews).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end

  describe 'GET /api/user_data/events' do
    it_behaves_like 'it serializes data to a CSV file', named: 'events.csv' do
      it 'has verified resources to serialize' do
        expect(user.events).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end

  describe 'GET /api/user_data/interactions' do
    it_behaves_like 'it serializes data to a CSV file', named: 'interactions.csv' do
      it 'has verified resources to serialize' do
        expect(user.events.flat_map(&:interactions)).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end

  describe 'GET /api/user_data/collaborations' do
    it_behaves_like 'it serializes data to a CSV file', named: 'collaborations.csv' do
      it 'has verified resources to serialize' do
        expect(user.interviews.flat_map(&:collaborator_feedbacks)).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end

  describe 'GET /api/user_data/events_interviewer_ratings' do
    it_behaves_like 'it serializes data to a CSV file', named: 'events_interviewer_ratings.csv' do
      let(:serializable_resources) { event_feedback }

      it 'has verified resources to serialize' do
        expect(user.events.flat_map(&:events_interviewers)).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end

  describe 'GET /api/user_data/interactions_interviewer_ratings' do
    it_behaves_like 'it serializes data to a CSV file', named: 'interactions_interviewer_ratings.csv' do
      let(:serializable_resources) { interaction_feedback }

      let(:associated_event_interaction_feedback) do
        user.events.flat_map(&:interactions).flat_map(&:interactions_interviewers)
      end

      it 'has verified resources to serialize' do
        expect(associated_event_interaction_feedback).to eq(serializable_resources)
        expect(serializable_resources.size).to eq(10)
      end
    end
  end
end

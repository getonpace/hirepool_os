require 'rails_helper'

RSpec.describe Api::EmailAccessKeysController, type: :controller do

  describe "POST #check" do
    let(:attributes) { {} }

    before do
      post :check, attributes
    end

    context 'with a group access key' do
      let(:access_group) do
        build_stubbed(:access_group).tap do |group|
          allow(AccessGroup).to receive(:find_by).with(key: group.key).and_return(group)
        end
      end

      let(:attributes) { {access_key: access_group.key} }

      it 'returns http success' do
        expect(response).to have_http_status(:success)
      end

      it 'responds with the access_group_id' do
        expect(response.body).to be_json_eql %({"access_group_id":#{access_group.id}})
      end
    end

    context 'with an email access key' do
      let(:email_access_key) do
        build_stubbed(:email_access_key).tap do |key|
          allow(EmailAccessKey).to receive(:find_by).with(email: key.email).and_return(key)
        end
      end

      let(:attributes) { email_access_key.attributes.slice('email', 'access_key') }

      it 'returns http success' do
        expect(response).to have_http_status(:success)
      end

      it 'responds with the access_key' do
        expect(response.body).to be_json_eql %({"access_key":#{email_access_key.to_json}})
      end
    end

    context 'with an invalid access key' do
      it 'returns http unauthorized' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'responds with the error status' do
        expect(response.body).to be_json_eql %({"status":"Invalid access key"})
      end
    end
  end

end
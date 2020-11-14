require 'rails_helper'

RSpec.feature "Authentications", type: :feature do
  pending "add some scenarios (or delete) #{__FILE__}"
end

# require 'spec_helper'

# RSpec.feature 'Authentication', js: true do
#   feature 'login' do
#     scenario 'with valid inputs' do
#       @user = FactoryGirl.create(:user)
#       visit '/sign_in'
#       fill_in "Email", with: @user.email
#       fill_in "Password", with: @user.password
#       find("button", text: "Sign in").click

#       expect(page).to have_content('Sign out')
#     end
#   end
# end
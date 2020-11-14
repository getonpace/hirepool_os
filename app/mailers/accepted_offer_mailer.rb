class AcceptedOfferMailer < ApplicationMailer
  def accepted_email(user, collaborator, company_name)
    @collaborator = collaborator
    @user = user
    @company_name = company_name
    mail(to: @collaborator.email , subject: "#{@user.name} has accepted an offer from #{@company_name}!") do |format|
      format.html { render 'accepted_email' }
      format.text
    end
  end
end

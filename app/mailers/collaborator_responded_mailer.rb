class CollaboratorRespondedMailer < ApplicationMailer
  def notification_email(user, company, interview, collaborator, url)
    @collaborator = collaborator
    @interview = interview
    @company = company
    @user = user
    @generated_url = "#{url}/app/\#/opportunity/#{@interview.id}"
    if url.index("localhost")
      @generated_url = "#{url}/\#/opportunity/#{@interview.id}"
    end

    if @user[:email]
      @email = @user[:email]
      if @user[:name]
        @email = %("#{@user[:name]}" <#{@user[:email]}>)
      end
      mail(to: @email , subject: "#{@collaborator.name} left feedback on #{@company.name}!") do |format|
        format.html { render 'notification_email' }
        format.text
      end
    end
  end
end

class UserCollaboratorMailer < ApplicationMailer
  def request_email(user, collaborator, collaborator_feedback, generated_url, company_name, job_title)
    @collaborator = collaborator
    @collaboratorFeedback = collaborator_feedback
    @user = user
    @generated_url = generated_url
    @company_name = company_name
    @job_title = ""
    if job_title
      @job_title = job_title + " "
    end
    mail(to: @collaborator.email , subject: "Feedback request from #{@user.name} on a #{@job_title}role at #{@company_name}") do |format|
      format.html { render 'request_email' }
      format.text
    end
  end
end

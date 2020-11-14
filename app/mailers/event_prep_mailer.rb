class EventPrepMailer < ApplicationMailer
  def request_email(user, interview, event, message, url)
    @user = user
    @interview = interview
    @event = event
    @message = message
    if url.index("localhost")
      @url = "#{url}/#/"
    else
      @url = "#{url}/app/#/"
    end

    if @user && @interview && @event && @message
      @company = Company.find_by(:id => @interview.company_id)
      @date = @event[:date].to_date
      if @user[:email]
        @email = @user[:email]
        if @user[:name]
          @email = %("#{@user[:name]}" <#{@user[:email]}>)
        end

        if @message == 1
          notification_email
        elsif @message == 2
          company_guide_email
        elsif @message == 3
          do_prep_email
        elsif @message == 4
          review_prep_email
        elsif @message == 5
          leave_feedback_email
        end
      end
    end
  end

  private

    def notification_email
      mail(to: @email, subject: "You've got an event coming up at #{@company.name}") do |format|
        format.html { render 'notification_email'}
        format.text { 'notification_email' }
      end
    end

    def company_guide_email
      mail(to: @email, subject: "Check out the company guide for #{@company.name}") do |format|
        format.html { render 'company_guide_email'}
        format.text { 'company_guide_email' }
      end
    end

    def do_prep_email
      mail(to: @email, subject: "Prep for your event at #{@company.name}") do |format|
        format.html { render 'do_prep_email'}
        format.text { 'do_prep_email' }
      end
    end

    def review_prep_email
      mail(to: @email, subject: "Review for your event at #{@company.name}") do |format|
        format.html { render 'review_prep_email'}
        format.text { 'review_prep_email' }
      end
    end

    def leave_feedback_email
      mail(to: @email, subject: "Rate your event at #{@company.name}") do |format|
        format.html { render 'leave_feedback_email'}
        format.text { 'leave_feedback_email' }
      end
    end

end

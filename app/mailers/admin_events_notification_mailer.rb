class AdminEventsNotificationMailer < ApplicationMailer

  def new_event_email(user, interview, event, url)
    @url = url
    @user = user
    @interview = interview
    @event = event
    @company = @interview.company

    tags = get_tags(@user)
    @signup_method = @user.access_group_id ? 'access group key' : 'waitlist key'
    @method_is_access_group = (@signup_method == 'access group key')
    @user_has_sponsor = @user.sponsor ? true : false
    @subject_string = "#{tags.join(' ')} #{@user.name} added an event at #{@company.name}"
    mail(to: 'support@hirepool.io' , subject: @subject_string) do |format|
      format.html { render 'new_event_email' }
      format.text
    end
  end

  def update_event_email(user, interview, event, url)
    @url = url
    @user = user
    @interview = interview
    @event = event
    @company = @interview.company

    tags = get_tags(@user)
    @signup_method = @user.access_group_id ? 'access group key' : 'waitlist key'
    @method_is_access_group = (@signup_method == 'access group key')
    @user_has_sponsor = @user.sponsor ? true : false
    @subject_string = "#{tags.join(' ')} #{@user.name} updated an event at #{@company.name}"
    mail(to: 'support@hirepool.io' , subject: @subject_string) do |format|
      format.html { render 'update_event_email' }
      format.text
    end
  end

  private
    def get_tags(user)
      tags = ['[ADMIN NOTIFIER]']

      @total_events = 0;
      @user.interviews.each { |interview|
        @total_events = @total_events + interview.events.length
      }
      if @total_events == 1
        tags.push('[FIRST EVENT]')
      end

      if @user.event_comm_target
        tags.push('[COMM TARGET]')
      end

      return tags

    end


end

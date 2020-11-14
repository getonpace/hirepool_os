class Api::EventMailersController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # PUT 'event_mailer/prep_kit'
  def prep_kit
    if params[:events]
      @emails_sent = []
      for event_id in params[:events]
        event = Event.find_by(:id => event_id)
        if event
          send_message = false;
          eventTime = event[:date]
          message_status = event[:prep_kit_message]
          if !message_status
            message_status = 0
          end
          # if date is 5 days away to 4 days away send `we're thinking of you` email
          if ( (eventTime > getDayTimeEarlyLimit(5) && eventTime < getDayTimeLateLimit(5)) || (eventTime > getDayTimeEarlyLimit(4) && eventTime < getDayTimeLateLimit(4)) ) && message_status == 0
            message_status = 1
            send_message = true;
          # if date is 3 days away send `check the company guide` email
          elsif eventTime > getDayTimeEarlyLimit(3) && eventTime < getDayTimeLateLimit(3) && message_status < 2
            message_status = 2
            send_message = true;
          # if date is 2 days away to 1 days away send `prep and take notes` email
          elsif ( (eventTime > getDayTimeEarlyLimit(2) && eventTime < getDayTimeLateLimit(2)) || (eventTime > getDayTimeEarlyLimit(1) && eventTime < getDayTimeLateLimit(1)) ) && message_status < 3
            message_status = 3
            send_message = true;
          # if date is today away send `review your notes` email
          elsif eventTime > Time.now && eventTime < (Time.now + 8.hours) && message_status < 4
            message_status = 4
            send_message = true;
          #if date is 1 days past send `submit feedback` email
          elsif eventTime > (Time.now - 12.hours) && eventTime < (Time.now - 4.hours) && message_status < 5 && event_needs_feedback(event)
            message_status = 5
            send_message = true;
          end
          if send_message
            still_send_message = true
            interview = Interview.find_by(:id => event[:interview_id])
            user = User.find_by(:id => interview[:user_id])
            if user[:event_prep_kit_opt_out]
              still_send_message = false
            else
              if message_status == 1
                if user[:sent_event_prep_kit_1]
                  still_send_message = false
                else
                  user[:sent_event_prep_kit_1] = true
                  user.save!
                end
              end
              if message_status == 2
                if user[:sent_event_prep_kit_2]
                  still_send_message = false
                else
                  user[:sent_event_prep_kit_2] = true
                  user.save!
                end
              end
            end
            if still_send_message
              url = "#{request.protocol}#{request.host}:#{request.port}"
              EventPrepMailer.request_email(user, interview, event, message_status, url).deliver_later
              event[:prep_kit_message] = message_status
              event.save!
              @emails_sent.push(event.id)
            end
          end
        end
      end
      render :json => { :success => true, :emails_sent => @emails_sent }
    else
      render :json => { :success => false }
    end
  end

  private
    def get_current_user
      @user = current_user
    end

    def getDayTimeEarlyLimit(days)
      return Time.now + days.days - 4.hours
    end

    def getDayTimeLateLimit(days)
      return Time.now + days.days + 2.hours
    end

    def event_needs_feedback(event)
      if event[:culture_val] || event[:one_word]
        return false
      end
      interviewers = event.interviewers
      if interviewers
        for interviewer in interviewers
          if interviewer[:excited]
            return false
          end
        end
      end
      interactions = event.interactions
      if interactions
        for interaction in interactions
          if interaction[:culture_val] || interaction[:one_word]
            return false
          end
          if interaction.interviewers
            for i_interviewer in interaction.interviewers
              if i_interviewer[:excited]
                return false
              end
            end
          end
        end
      end
      return true
    end

end

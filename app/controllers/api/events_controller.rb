class Api::EventsController < ApplicationController
  before_action :authenticate_user!
  before_action :get_current_user

  # GET 'events/overview/:days'
  def overview
    if @user.is_admin
      if @user[:sponsor] == "hirepool"
        if params[:days] == "all"
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("(users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)").order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("events.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", params[:days].to_i.days.ago).order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("events.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", 30.days.ago).order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      elsif @user[:sponsor]
        if params[:days] == "all"
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor]).order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        elsif params[:days]
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND events.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], params[:days].to_i.days.ago).order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        else
          # default 30 days
          render :json => { :success => true, :events => Event.joins(:interview => :user).where("users.sponsor = ? AND (users.user_agreement_status = 'accepted' || users.user_agreement_status = 'auto-accepted') AND events.updated_at > ? AND (users.is_test_account = false OR users.is_test_account IS NULL) AND (users.is_admin = false OR users.is_admin IS NULL)", @user[:sponsor], 30.days.ago).order("events.created_at DESC").as_json({:admin_data => true}) }, :status => 200
        end
      else
        render :json => { :success => false, :error => "nope" }, :status => 403
      end
    else
      render :json => { :success => false, :error => "nope" }, :status => 403
    end
  end

  # POST 'events/notes/:id'
  def notes
    @event = get_current_event
    @interview = get_current_interview
    if !@event
      render :json => { :success => false, :error => "no ev" }
    elsif params[:interviewer_id]
      ActiveRecord::Base.transaction do
        @interviewer = Interviewer.find_by(:id => params[:interviewer_id])
        if @interviewer

          # make sure interviewer is unique for user and company (legacy code allowed duplicates)
          if @interviewer[:user_id] != @user[:id] || @interviewer[:company_id] != @interview[:company_id]
            @new_interviewer = Interviewer.create(get_interviewer_hash(@interviewer))
            @new_interviewer[:user_id] = @user[:id]
            @new_interviewer[:company_id] = @interview[:company_id]
            @new_interviewer.save!

            # for each event in the interview
            if @interview.events
              for event in @interview.events
                # check each interviewer
                events_interviewers = EventsInterviewer.where(:event_id => event[:id], :interviewer_id => @interviewer[:id])
                if events_interviewers
                  for e_i in events_interviewers
                    e_i[:interviewer_id] = @new_interviewer[:id]
                    e_i.save!
                  end
                end
                # for each interaction in the event
                if event.interactions
                  for interaction in event.interactions
                    #check each interviewer
                    interactions_interviewers = InteractionsInterviewer.where(:interaction_id => interaction[:id], :interviewer_id => @interviewer[:id])
                    if interactions_interviewers
                      for i_i in interactions_interviewers
                        i_i[:interviewer_id] = @new_interviewer[:id]
                        i_i.save!
                      end
                    end
                  end
                end
              end
            end

            @interviewer = @new_interviewer
          end

          @interviewer[:notes] = params[:notes]
          @interviewer.save!
          render :json => { :success => true }
        else
          render :json => { :success => false, :error => "no i" }
        end
      end
    else
      ActiveRecord::Base.transaction do
        @event[:notes] = params[:notes]
        @event.save!
      end
      render :json => { :success => true }
    end
  end

  def index
    @interview = @user.interviews.find_by(:id => params[:interview_id])
    if !@interview
     render :json => { :status => :not_found }
    else
      render :json => { :success => true, :events => @interview.events }
    end
  end

  def create
    @interview = get_current_interview
    ActiveRecord::Base.transaction do
      @event = Event.new(event_params)
      @event[:interview_id] = @interview[:id]
      @interview.events << @event
      @company_id = @interview[:company_id]

      if params[:event]

        if params[:event][:interviewers]
          params[:event][:interviewers].each do |interviewer|
            @interviewer = nil
            if interviewer[:name]
              if interviewer[:email]
                @interviewer = Interviewer.find_by(:name => interviewer[:name], :email => interviewer[:email], :company_id => @company_id, :user_id => @user[:id])
              else
                @interviewer = Interviewer.where("name = ? AND company_id = ? AND user_id = ? AND email IS NULL", interviewer[:name], @company_id, @user[:id]).last
              end
            end
            if @interviewer
              @interviewer[:notes] = interviewer[:notes]  if interviewer.has_key? :notes
              @interviewer[:relationship] = interviewer[:relationship] if interviewer.has_key? :relationship
              @interviewer.save!
            else
              @interviewer = Interviewer.create!(get_interviewer_hash(interviewer))
              @interviewer[:user_id] = @user[:id]
              @interviewer[:company_id] = @company_id
              @interviewer.save!
            end
            @event.interviewers << @interviewer
            @interview.events[@interview.events.length] = @event
            @interview.save!
            @events_interviewers = EventsInterviewer.where(:interviewer_id => @interviewer[:id], :event_id => @event[:id]).endmost(1).take
            if @events_interviewers
              @events_interviewers.update!(get_events_interviewers_hash(interviewer))
            end
          end
        end

        if params[:event][:interactions]
          params[:event][:interactions].each do |interaction|
            @interaction = Interaction.create!(get_interaction_hash(interaction))
            @event.interactions << @interaction
            if interaction[:interviewers]
              interaction[:interviewers].each do |i_interviewer|
                @i_interviewer = nil
                if i_interviewer[:name]
                  if i_interviewer[:email]
                    @i_interviewer = Interviewer.find_by(:name => i_interviewer[:name], :email => i_interviewer[:email], :company_id => @company_id, :user_id => @user[:id])
                  else
                    @i_interviewer = Interviewer.where("name = ? AND company_id = ? AND user_id = ? AND email IS NULL", i_interviewer[:name], @company_id, @user[:id]).last
                  end
                end
                if @i_interviewer
                  @i_interviewer[:notes] = i_interviewer[:notes] if i_interviewer.has_key? :notes
                  @i_interviewer[:relationship] = i_interviewer[:relationship] if i_interviewer.has_key? :relationship
                  @i_interviewer.save!
                else
                  @i_interviewer = Interviewer.create!(get_interviewer_hash(i_interviewer))
                  @i_interviewer[:user_id] = @user[:id]
                  @i_interviewer[:company_id] = @company_id
                  @i_interviewer.save!
                end
                @interaction.interviewers << @i_interviewer
                @event.interactions[@event.interactions.length] = @interaction
                @interview.events[@interview.events.length] = @event
                @interview.save!
                @interactions_interviewers = InteractionsInterviewer.where(:interviewer_id => @i_interviewer[:id], :interaction_id => @interaction[:id]).endmost(1).take
                if @interactions_interviewers
                  @interactions_interviewers.update!(get_interactions_interviewers_hash(i_interviewer))
                end
              end
            end
          end
        end

      end
      @interview.events[@interview.events.length] = @event
      @interview.save!
    end

    render :json => { :success => true, :event => @event }
  end

  def update
    @event = get_current_event
    @interview = get_current_interview
    if !@event
      render :json => { :status => :not_found }
    else
      ActiveRecord::Base.transaction do
        @event.update!(event_params)

        @event.interviewers.clear
        if params[:event][:interviewers]
          params[:event][:interviewers].each do |interviewer|
            @interviewer = nil
            if interviewer[:name] && interviewer[:company_id] && interviewer[:user_id]
              if interviewer[:email]
                @interviewer = Interviewer.find_by(:name => interviewer[:name], :email => interviewer[:email], :company_id => interviewer[:company_id], :user_id => interviewer[:user_id])
              else
                @interviewer = Interviewer.where("name = ? AND company_id = ? AND user_id = ? AND email IS NULL", interviewer[:name], interviewer[:company_id], interviewer[:user_id]).last
              end
            end
            if @interviewer
              @interviewer[:notes] = interviewer[:notes] if interviewer.has_key? :notes
              @interviewer[:relationship] = interviewer[:relationship] if interviewer.has_key? :relationship
              @interviewer.save!
            else
              @interviewer = Interviewer.create!(get_interviewer_hash(interviewer))
              @interviewer[:user_id] = @user[:id]
              @interviewer[:company_id] = @interview[:company_id]
              @interviewer.save!
            end
            @event.interviewers << @interviewer
            @events_interviewers = EventsInterviewer.where(:interviewer_id => @interviewer[:id], :event_id => @event[:id]).endmost(1).take
            if @events_interviewers
              @events_interviewers.update!(get_events_interviewers_hash(interviewer))
            end
          end
        end

        @event.interactions.clear
        if params[:event][:interactions]
          params[:event][:interactions].each do |interaction|
            @interaction = nil
            if interaction[:id]
              @interaction = Interaction.find_by(:id => interaction[:id])
              @interaction.update!(get_interaction_hash(interaction))
            end
            if !@interaction
              @interaction = Interaction.create!(get_interaction_hash(interaction))
            end
            @event.interactions << @interaction
            @event.save!
            @interaction.interviewers.clear
            if interaction[:interviewers]
              interaction[:interviewers].each do |i_interviewer|
                @i_interviewer = nil
                if i_interviewer[:name] && i_interviewer[:company_id] && i_interviewer[:user_id]
                  if i_interviewer[:email]
                    @i_interviewer = Interviewer.find_by(:name => i_interviewer[:name], :email => i_interviewer[:email], :company_id => i_interviewer[:company_id], :user_id => i_interviewer[:user_id])
                  else
                    @i_interviewer = Interviewer.where("name = ? AND company_id = ? AND user_id = ? AND email IS NULL", i_interviewer[:name], i_interviewer[:company_id], i_interviewer[:user_id]).last
                  end
                end
                if @i_interviewer
                  @i_interviewer[:notes] = i_interviewer[:notes]  if i_interviewer.has_key? :notes
                  @i_interviewer[:relationship] = i_interviewer[:relationship]  if i_interviewer.has_key? :relationship
                  @i_interviewer.save!
                else
                  @i_interviewer = Interviewer.create!(get_interviewer_hash(i_interviewer))
                  @i_interviewer[:user_id] = @user[:id]
                  @i_interviewer[:company_id] = @interview[:company_id]
                  @i_interviewer.save!
                end
                @interaction.interviewers << @i_interviewer
                @interaction.save!
                @interactions_interviewers = nil
                @interactions_interviewers = InteractionsInterviewer.where(:interviewer_id => @i_interviewer[:id], :interaction_id => @interaction[:id]).endmost(1).take
                if !@interactions_interviewers
                  @interaction.interviewers << @i_interviewer
                  @interaction.save!
                  @interactions_interviewers = InteractionsInterviewer.where(:interviewer_id => @i_interviewer[:id], :interaction_id => @interaction[:id]).endmost(1).take
                end
                if @interactions_interviewers
                  @interactions_interviewers.update!(get_interactions_interviewers_hash(i_interviewer))
                end
              end
            end
          end
        end

      end

      render :json => { :success => true, :event => @event }
    end
  end

  def destroy
    @user.interviews.each do |interview|
      @event = interview.events.find_by(:id => params[:id])
      if @event
        break
      end
    end
    if !@event
     render :json => { :status => :not_found }
    else
      ActiveRecord::Base.transaction do
        if @event.interactions
          @event.interactions.each do |interaction|
            interaction.interviewers.clear
            interaction.destroy!
          end
        end
        @event.destroy!
      end
      render :json => { :success => true }
    end
  end

  private

    def interview_params
      params.require(:interview).permit(:id)
    end

    def event_params
      params.require(:event).permit(:id, :interviewer_id, :interview_id, :style, :date, :time_specified, :interviewer_relationship, :substyle, :one_word, :culture_val, :notes)
    end

    def get_interviewer_hash(interviewer_params)
      interviewer_hash = interviewer_params.slice(:name, :email, :company_id, :user_id, :notes, :relationship).reject { |k, v| v.nil? }.symbolize_keys
    end

    def get_interaction_hash(interaction_params)
      interaction_hash = interaction_params.slice(:id, :event_id, :style, :culture_val, :one_word, :excited).reject { |k, v| v.nil? }.symbolize_keys
    end

    def get_events_interviewers_hash(interview_params)
      events_interviewers_hash = interview_params.slice(:interview_id, :event_id, :excited, :is_poc).reject { |k, v| v.nil? }.symbolize_keys
    end

    def get_interactions_interviewers_hash(interview_params)
      interactions_interviewers_hash = interview_params.slice(:interview_id, :interaction_id, :excited).reject { |k, v| v.nil? }.symbolize_keys
    end

    def get_current_user
      @user = current_user
    end

    def get_current_event
      interview = get_current_interview
      interview.events.find_by(:id => params[:id])
    end

    def get_current_interview
      @user.interviews.find_by(:id => interview_params[:id])
    end
end

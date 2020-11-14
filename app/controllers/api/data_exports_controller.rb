# frozen_string_literal: true

class Api::DataExportsController < ApplicationController
  before_action :authenticate_user!

  #
  # GET '/api/data_exports/opportunities(.:format)'
  #
  def interviews
    # Get interviews/opportunities for the current user
    interviews = current_user.interviews.includes(:company, :offer)

    respond_to do |format|
      format.csv do
        render csv: OpportunitiesCsvSerializer.new(interviews),
               filename: :opportunities
      end
    end
  end

  #
  # GET '/api/data_exports/events(.:format)'
  #
  def events
    # Get events for the current user
    events = current_user.events.includes(interview: :company)

    respond_to do |format|
      # CSV Filename will default to the action_name
      format.csv { render csv: EventsCsvSerializer.new(events) }
    end
  end

  #
  # GET '/api/data_exports/interactions(.:format)'
  #
  def interactions
    # Build a query to get interactions for events/interviews
    all_interactions = Interaction.joins(event: {interview: :company}) \
                                  .includes(event: {interview: :company})

    # Filter those interactions by the current_user's interviews
    interactions = all_interactions.merge(current_user.interviews)

    respond_to do |format|
      # CSV Filename will default to the action_name
      format.csv { render csv: InteractionsCsvSerializer.new(interactions) }
    end
  end

  #
  # GET '/api/data_exports/collaborations(.:format)'
  #
  def collaborations
    # Build a query to get collaborator feedback for interviews
    feedback = CollaboratorFeedback.includes(interview: :company) \
                                   .includes(:collaborator) \
                                   .references(:interview, :collaborator)

    # Filter the feedback by only the current_user's interviews
    collaborations = feedback.merge(current_user.interviews)

    respond_to do |format|
      # CSV Filename will default to the action_name
      format.csv { render csv: CollaborationsCsvSerializer.new(collaborations) }
    end
  end

  #
  # GET '/api/data_exports/events_interviewer_ratings(.:format)'
  #
  def events_interviewers
    # Build a query to get interviewer ratings for events
    ratings = EventsInterviewer.includes(:interviewer) \
                               .includes(event: {interview: :company}) \
                               .references(:interviewer, :event)

    # Filter those interviewer ratings by the current_user's interviews
    user_ratings = ratings.merge(current_user.interviews)

    respond_to do |format|
      format.csv do
        render csv: EventsInterviewerRatingsCsvSerializer.new(user_ratings),
               filename: :events_interviewer_ratings
      end
    end
  end

  #
  # GET '/api/data_exports/interactions_interviewer_ratings(.:format)'
  #
  def interactions_interviewers
    # Build a query to get interviewer ratings for interactions
    ratings = InteractionsInterviewer.includes(:interviewer) \
                                     .includes(interaction: {event: {interview: :company}}) \
                                     .references(:interviewer, :interaction)

    # Filter those interviewer ratings by the current_user's interviews
    user_ratings = ratings.merge(current_user.interviews)

    respond_to do |format|
      format.csv do
        render csv: InteractionsInterviewerRatingsCsvSerializer.new(user_ratings),
               filename: :interactions_interviewer_ratings
      end
    end
  end
end

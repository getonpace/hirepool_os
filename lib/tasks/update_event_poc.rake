namespace :update_event_poc do
  desc "Updates the point of contact for each event so that the interviewer is stored in the list of interviewers for the event."

  # Get all events, iterate through and add the interviewer tied to the event to
  # the list of interviewers, and set it as the poc via the is_poc field
  task update_event_poc: :environment do

    total_events = 0
    events = Event.all
    # interviews = Interview.joins(:interviews_interviewers).includes(:interviews_interviewers, :user)

    puts "Processing #{events.count} events"

    events.each do |event|
      total_events = total_events + 1
      puts "Processing event ID: #{event[:id]}, with interviewer id #{event[:interviewer_id]}"

      interviewer = Interviewer.find_by(:id => event[:interviewer_id])
      if interviewer
        event.interviewers << interviewer
        event.save
        events_interviewers = EventsInterviewer.where(:interviewer_id => interviewer[:id], :event_id => event[:id]).endmost(1).take
        events_interviewers[:is_poc] = true
        events_interviewers[:relationship] = event.interviewer_relationship
        events_interviewers.save
      end
    end
    puts "Processed #{total_events} events"
  end
end


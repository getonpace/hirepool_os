namespace :events_data_migration do
  desc "get all interviews_interviewers and create a new event for each one"

  # Take interviews_interviewers and create an event with the same interviewer
  # and one interaction, with the same details as the original event (including
  # the same interviewer) but with feedback fields (one_word, culture_val) and
  # with excited field in the interaction_interviewer record
  task migrate_interviews_interviewers: :environment do
    total_interviews = 0
    interviews = Interview.joins(:interviews_interviewers).includes(:interviews_interviewers, :user)

    puts "Processing #{interviews.count} interviews"

    interviews.each do |interview|
      total_interviews = total_interviews + 1
      puts "Processing interview ID: #{interview.id} with #{interview.interviews_interviewers.count} interviews_interviewers"

      interview.interviews_interviewers.each do |ii|
        puts "Processing interviews_interviewer: #{ii.id}"

        ActiveRecord::Base.transaction do
          event = Event.create
          event.interview_id = ii.interview_id
          event.interviewer = ii.interviewer
          event.interviewer_relationship = ii.relationship
          event.style = ii.style
          event.date = ii.date
          event.time_specified = false
          event.save

          interaction = Interaction.create
          interaction.style = ii.style
          if ii.culture_val
            interaction.culture_val = ii.culture_val
          end
          if ii.one_word
            interaction.one_word = ii.one_word
          end
          interaction.interviewers << ii.interviewer
          event.interactions << interaction
          interaction.save

          interactions_interviewer = InteractionsInterviewer.where(:interviewer_id => ii.interviewer[:id], :interaction_id => interaction[:id]).endmost(1).take
          interactions_interviewer.relationship = ii.relationship
          if (ii.excited)
            interactions_interviewer.excited = ii.excited
          end
          interactions_interviewer.save

          event.interactions << interaction
          event.save

        end
      end
    end
    puts "Processed #{total_interviews} interviews"
  end
end


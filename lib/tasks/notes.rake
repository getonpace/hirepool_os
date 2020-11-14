namespace :notes do
  desc "Looks for existing notes and aggregate them to a single note under Interview"

  # Take individual notes stores under each interviews_interviewers and combine
  # them into a single "note" separated by Interview #
  task aggregate_user_notes: :environment do
    total_notes = 0;
    # first, find all Interviews that have notes including the User and
    # InterviewsInterviewers
    interviews = Interview.joins(:interviews_interviewers).includes(:interviews_interviewers, :user).where("interviews_interviewers.notes IS NOT NULL")

    puts "Processing #{interviews.count} interviews"

    interviews.each do |interview|
      aggregated_notes = []
      notes_count = 1;
      puts "Processing interview ID: #{interview.id}"

      interview.interviews_interviewers.each do |ii|
        puts "Processing note: #{ii.notes}"
        aggregated_notes << "<p>Interview with #{ii.interviewer.name} for #{interview.job_title} at #{ii.date}</p>\n\n<p>" + ii.notes + "</p>\n"
        total_notes += 1
        notes_count += 1
      end
      aggregated_notes = aggregated_notes.join("\n")
      puts "Aggregated notes: #{aggregated_notes}\n\n"
      interview.notes = aggregated_notes
    end

    puts "Saving notes to each interview"
    Interview.transaction do
      interviews.each(&:save!)
    end

    puts "Total notes processed #{total_notes}"
  end

end

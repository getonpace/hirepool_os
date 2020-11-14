module Helpers
  module RequestSpecs
    def follow_all_redirects!
      follow_redirect! while response.status.to_s =~ /^3\d{2}/
    end

    # Suppress OmniAuth logger output
    def silence_omniauth
      previous_logger = OmniAuth.config.logger
      OmniAuth.config.logger = Logger.new('/dev/null')
      yield
    ensure
      OmniAuth.config.logger = previous_logger
    end
  end
end

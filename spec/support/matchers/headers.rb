# frozen_string_literal: true

#
# Matchers for checking HTTP headers
#
module Matchers
  module Headers
    #
    # A matcher to check the 'Content-Disposition' header
    #
    # @examples
    #
    #   expect(response).to have_disposition('attachment')
    #   # => True if `response.headers['Content-Disposition'] = 'attachment'`
    #
    #   expect(response).to have_disposition('attachment').with(filename: 'my_file.txt')
    #   # => True if `response.headers['Content-Disposition'] = 'attachment; filename=my_file.txt'`
    #
    RSpec::Matchers.define :have_disposition do |disposition|
      chain :with do |attributes|
        raise 'Hash expected' unless attributes.is_a? Hash
        @attributes = attributes
      end

      match do |response|
        @actual = response.headers['Content-Disposition']
        @expected = disposition + @attributes.map { |k, v| "; #{k}=#{v}" }.reduce('', &:+)
        expect(@actual).to eq(@expected)
      end

      failure_message do
        msg = "expected '#{@actual}' to equal '#{@expected}'."
        msg += "\n\nDiff:" + differ.diff_as_string(@expected, @actual)
        msg
      end

      def differ
        RSpec::Support::Differ.new(
          object_preparer: ->(obj) { RSpec::Matchers::Composable.surface_descriptions_in(obj) },
          color: RSpec::Matchers.configuration.color?
        )
      end
    end
  end
end

# frozen_string_literal: true

require 'csv'

# require 'serializers/to_csv/exceptions'

module Serializers
  module ToCsv
    class Generator
      #
      # From docs for CSV:
      #   `::CSV::ConverterEncoding` is set to `::Encoding.find("UTF-8")`
      #
      TitleConverter = ->(h) { h.to_s.encode(::CSV::ConverterEncoding).titleize }

      DEFAULT_OPTIONS = Hash[
        headers: true,
        return_headers: true,
      ]

      attr_reader :headers, :options

      def initialize(attributes:, delegator:, **options)
        @headers = attributes

        #
        # Initialize the delegator with an empty array, and utilize
        # SimpleDelegator#__setobj__ to update the delegated object
        # as enumerating over the resources collection.
        #
        @resource_delegator = delegator.new

        #
        # Merge provided options, if any, with defaults for CSV::generate
        #
        @options = DEFAULT_OPTIONS.merge(options) do |_, default, opt|
          default.is_a?(Array) && opt.is_a?(Array) ? (default | opt) : opt
        end
      end

      #
      # Serialize the provided resources into a CSV string, utilizing
      # the delegator instance to get each resource attribute.
      #
      def serialize(resources)
        CSV.generate(options) do |csv|
          #
          # Set the headers for the CSV
          #
          csv << headers.collect(&TitleConverter)

          #
          # Set the rows of the CSV
          #
          resources.each do |resource|
            csv << values_for(resource)
          end
        end
      end

      protected

      attr_reader :resource_delegator

      def values_for(resource)
        #
        # Memoize the delegated values for each resource in a hash object.
        # The block given to the Hash::new constructor is called each time a
        # non-existent key is requested
        #
        @values ||= Hash.new do |hsh, obj|
          resource_delegator.__setobj__(obj)
          hsh[obj] = headers.collect(&resource_delegator.method(:send))
        end

        #
        # Retrieve the memoized values for a resource, or
        #
        @values[resource]
      end
    end
  end
end

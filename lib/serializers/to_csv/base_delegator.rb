# frozen_string_literal: true

require 'delegate'

module Serializers
  module ToCsv
    class BaseDelegator < SimpleDelegator
      #
      # Override the inherited constructor from the ::Delegator class,
      # to allow instantiation without providing a delegation object.
      #
      # Additionally, allow a list of
      #
      def initialize(obj = nil)
        super(obj) unless obj.nil?
      end
    end
  end
end
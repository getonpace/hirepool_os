# frozen_string_literal: true

require 'serializers/to_csv/columns'
require 'serializers/to_csv/delegator'
require 'serializers/to_csv/generator'

require 'serializers/to_csv/railtie' if defined?(::Rails::Railtie)

module Serializers
  module ToCsv
    def self.included(base)
      base.extend Columns
      base.extend Delegator
    end

    attr_accessor :resources, :generator

    def initialize(serializable, **options)
      @resources = Array(serializable)

      self.class.tap do |serialization|
        @generator = Generator.new(
          attributes: serialization.attributes,
          delegator: serialization.delegator,
          **options
        )
      end
    end

    def to_csv
      @generator.serialize(resources)
    end
  end
end

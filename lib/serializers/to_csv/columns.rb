# frozen_string_literal: true

require 'set'

require 'serializers/to_csv/exceptions'
require 'serializers/to_csv/delegator'

module Serializers
  module ToCsv
    module Columns
      attr_reader :attributes

      # Initialize class instance variables
      def self.extended(base)
        base.instance_variable_set(:@attributes, Set.new)
      end

      # Handle an array of mixed column definitions
      def columns(*cols)
        cols.each do |col|
          case col
          when Symbol      then column(col)
          when Array, Hash then delegate_column(col)
          else raise ColumnDeclarationError
          end
        end
      end

      def column(column_name)
        # Add column_name to the attributes set
        attributes.add(column_name)
      end

      def titleized_attributes
        attributes.collect(&Generator::TitleConverter)
      end
    end
  end
end

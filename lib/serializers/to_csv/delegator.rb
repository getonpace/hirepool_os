# frozen_string_literal: true

require 'set'

require 'active_support'
require 'active_support/core_ext/enumerable'
require 'active_support/core_ext/module/delegation'

require 'serializers/to_csv/exceptions'
require 'serializers/to_csv/columns'
require 'serializers/to_csv/base_delegator'

module Serializers
  module ToCsv
    module Delegator
      DELEGATOR_CLASS = :AttributeDelegator
      METHODS_CONTAINER = ->(hash, key) { hash[key] = Set.new }

      attr_reader :delegated_accessors, :delegated_attributes

      def self.extended(base)
        #
        # Define the delegator/decorator class to wrap the resource
        #
        base.const_set(DELEGATOR_CLASS, Class.new(BaseDelegator))

        #
        # Define an accessor for the delegator class
        #
        base.define_singleton_method(:delegator) { const_get(DELEGATOR_CLASS) }

        #
        # Initialize class instance variables
        #
        base.instance_variable_set(:@delegated_accessors, Hash.new(&METHODS_CONTAINER))
        base.instance_variable_set(:@delegated_attributes, Hash.new(&METHODS_CONTAINER))
      end

      def delegate_accessors(*delegate_accessor_names, to:)
        Array(delegate_accessor_names).each do |accessor_name|
          #
          # Store the delegated accessors
          #
          delegated_accessors[to].add(accessor_name)

          #
          # Define the delegated method
          #
          delegator.instance_eval do
            delegate accessor_name, to: to, prefix: true, allow_nil: true
          end
        end
      end

      alias delegate_accessor delegate_accessors

      def delegate_columns(*delegate_column_names, **delegate_columns_map)
        if delegate_columns_map.any?
          raise MultipleMappedColumnsError if delegate_columns_map.many?
          raise DuplicateDelegateColumnsError if delegate_column_names.any?

          #
          # Convert the delegate_columns_map into delegate_column_names
          #
          delegate_column_names = delegate_columns_map.to_a.flatten
        end

        #
        # Nothing to delegate; no columns given
        #
        raise ArgumentError, 'No delegates provided' if delegate_column_names.empty?

        #
        # Delegate all subsequent column names to the first element; raise
        # an error if there are no remaining column names to delegate to.
        #
        delegate_to = delegate_column_names.shift
        raise NoDelegateMethodsError.new(delegate_to) if delegate_column_names.empty?

        #
        # Add column_name to the delegated_attributes hash
        #
        Array(delegate_column_names).each do |column_name|
          delegated_attributes[delegate_to].add(column_name)

          #
          # Define a delegator method for each value in the col hash.
          #
          delegator.instance_eval do
            delegate column_name, to: delegate_to, prefix: true, allow_nil: true
          end

          #
          # Add the delegated method as a column attribute
          #
          column("#{delegate_to}_#{column_name}".to_sym)
        end
      end

      alias delegate_column delegate_columns
    end
  end
end
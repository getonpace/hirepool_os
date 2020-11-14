# frozen_string_literal: true

require 'rails_helper'

require 'serializers/to_csv'

require 'pry'
require 'pry-byebug'

# Helper method to dynamically build a stubbed class that includes
#   the Serializers::ToCsv module under test.
def stubbed_serializer_class(name = 'DummySerializer', &block)
  stub_const(name, Class.new)
  name.constantize.tap do |klass|
    klass.class_eval { include Serializers::ToCsv }
    klass.class_eval(&block) if block_given?
  end
end

# Helper method to remove meta-programmed modules
def reset_modules(*module_names, namespace: Object)
  module_names.collect do |name|
    namespace.send(:remove_const, name) if namespace.constants.include?(name)
  end
end

alias reset_module reset_modules

# rubocop:disable Metrics/BlockLength
RSpec.describe Serializers::ToCsv do
  let(:serializer_class) { stubbed_serializer_class }
  let(:serializable)     { double('Serializable') }
  let(:serializer)       { serializer_class.new([serializable]) }

  subject(:delegated_accessors)  { serializer_class.delegated_accessors }
  subject(:parsed_attributes)    { serializer_class.attributes }
  subject(:titleized_attributes) { serializer_class.titleized_attributes }
  subject(:delegated_attributes) { serializer_class.delegated_attributes }
  subject(:delegator)            { serializer_class.delegator }

  # Clean up any meta-programmed modules containing delegated methods
  after(:example) do
    reset_modules(
      Serializers::ToCsv::Delegator::DELEGATOR_CLASS,
      namespace: serializer_class
    )
  end

  describe 'column declaration' do
    context 'a single column' do
      let(:serializer_class) do
        stubbed_serializer_class('SingleColumnSerializer') do
          column :a_column
        end
      end

      it 'adds the column to the set of parsed attributes' do
        expect(parsed_attributes).to include(:a_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('A Column')
      end
    end

    context 'multiple columns' do
      let(:serializer_class) do
        stubbed_serializer_class('MultiColumnSerializer') do
          column :first_column
          column :second_column
        end
      end

      it 'adds the columns to the set of parsed attributes' do
        expect(parsed_attributes).to include(:first_column, :second_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('First Column', 'Second Column')
      end
    end
  end

  describe 'delegated column declaration' do
    context 'with array arguments' do
      let(:serializer_class) do
        stubbed_serializer_class('DelegatedArrayColumnSerializer') do
          delegate_column :delegated_to, :a_column
        end
      end

      it 'parses the delegate and it\'s specified column' do
        expect(delegated_attributes).to include(
          delegated_to: a_collection_containing_exactly(:a_column)
        )
      end

      it 'defines a method that delegates to the given column' do
        expect(delegator.instance_methods).to include(:delegated_to_a_column)
      end

      it 'adds the resulting delegated column to the set of parsed attributes' do
        expect(parsed_attributes).to include(:delegated_to_a_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('Delegated To A Column')
      end
    end

    context 'with hash arguments' do
      let(:serializer_class) do
        stubbed_serializer_class('DelegatedHashColumnSerializer') do
          delegate_column delegated_to: :a_column
        end
      end

      it 'parses the delegate and it\'s specified column' do
        expect(delegated_attributes).to include(
          delegated_to: a_collection_containing_exactly(:a_column)
        )
      end

      it 'defines a method that delegates to the specified column' do
        expect(delegator.instance_methods).to include(:delegated_to_a_column)
      end

      it 'adds the resulting delegated column to the set of parsed attributes' do
        expect(parsed_attributes).to include(:delegated_to_a_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('Delegated To A Column')
      end
    end
  end

  describe 'mixed columns declaration' do
    context 'with a list of columns' do
      let(:serializer_class) do
        stubbed_serializer_class('MixedListColumnsSerializer') do
          columns :first_column,
                  :second_column
        end
      end

      it 'adds the columns to the set of parsed attributes' do
        expect(parsed_attributes).to include(:first_column, :second_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('First Column', 'Second Column')
      end
    end

    context 'with a list of columns and a single delegated column' do
      let(:serializer_class) do
        stubbed_serializer_class('MixedListColumnsAndDelegatedColumnSerializer') do
          columns :first_column,
                  :second_column,
                  {delegated_to: :a_column}
        end
      end

      it 'parses the delegate and it\'s specified columns' do
        expect(delegated_attributes).to include(
          delegated_to: a_collection_containing_exactly(:a_column)
        )
      end

      it 'defines a method that delegates to the specified column' do
        expect(delegator.instance_methods).to include(:delegated_to_a_column)
      end

      it 'adds the columns, including delegated columns, to the set of parsed attributes' do
        expect(parsed_attributes).to include(
          :first_column,
          :second_column,
          :delegated_to_a_column
        )
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include(
          'First Column',
          'Second Column',
          'Delegated To A Column'
        )
      end
    end

    context 'with a mixed list of columns and delegated columns' do
      let(:serializer_class) do
        stubbed_serializer_class('MixedListColumnsAndDelegatedColumnsSerializer') do
          columns :first_column,
                  :second_column,
                  {delegated_to: :a_column},
                  {also_delegated_to: [:chunky, :bacon]}
        end
      end

      it 'defines methods that delegate to the specified columns' do
        expect(delegator.instance_methods).to include(
          :delegated_to_a_column,
          :also_delegated_to_chunky,
          :also_delegated_to_bacon
        )
      end

      it 'parses the delegates and their specified columns' do
        expect(delegated_attributes).to include(
          delegated_to: a_collection_containing_exactly(:a_column),
          also_delegated_to: a_collection_containing_exactly(:chunky, :bacon)
        )
      end

      it 'adds the columns, including delegated columns, to the set of parsed attributes' do
        expect(parsed_attributes).to include(
          :first_column,
          :second_column,
          :delegated_to_a_column,
          :also_delegated_to_chunky,
          :also_delegated_to_bacon
        )
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include(
          'First Column',
          'Second Column',
          'Delegated To A Column',
          'Also Delegated To Chunky',
          'Also Delegated To Bacon'
        )
      end
    end
  end

  describe 'accessor method delegation' do
    context 'to a single target' do
      let(:serializer_class) do
        stubbed_serializer_class('AccessorSingleDelegationSerializer') do
          delegate_accessor :target, to: :accessor
        end
      end

      it 'parses the delegated targets to the specified accessor' do
        expect(delegated_accessors).to include(
          accessor: a_collection_containing_exactly(:target)
        )
      end

      it 'defines a method, delegating the target to the specified accessor' do
        expect(delegator.instance_methods).to include(:accessor_target)
      end

      it 'does not delegate to any attributes' do
        expect(delegated_attributes).to be_empty
      end

      it 'does not parse any attributes' do
        expect(parsed_attributes).to be_empty
      end
    end

    context 'to a list of targets' do
      let(:serializer_class) do
        stubbed_serializer_class('AccessorListOfDelegationsSerializer') do
          delegate_accessor :first_target, :second_target, to: :accessor
        end
      end

      it 'parses the delegated targets to the specified accessor' do
        expect(delegated_accessors).to include(
          accessor: a_collection_containing_exactly(:first_target, :second_target)
        )
      end

      it 'defines methods for delegating targets to the specified accessor' do
        expect(delegator.instance_methods).to include(
          :accessor_first_target,
          :accessor_second_target
        )
      end

      it 'does not delegate to any attributes' do
        expect(delegated_attributes).to be_empty
      end

      it 'does not parse any attributes' do
        expect(parsed_attributes).to be_empty
      end
    end

    context 'with delegated column declaration against it' do
      let(:serializer_class) do
        stubbed_serializer_class('AccessorDelegationAndColumnDelegationSerializer') do
          delegate_accessor :target, to: :accessor
          columns :single_column,
                  {accessor_target: :a_column}
        end
      end

      it 'parses the delegated targets to the specified accessor' do
        expect(delegated_accessors).to include(
          accessor: a_collection_containing_exactly(:target)
        )
      end

      it 'defines methods for delegating targets to the specified accessor' do
        expect(delegator.instance_methods).to include(:accessor_target)
      end

      # Test that delegated accessors work in conjunction with delegated attributes

      it 'defines methods that delegate to the specified columns' do
        expect(delegator.instance_methods).to include(:accessor_target_a_column)
      end

      it 'parses the delegated attribute and it\'s specified column' do
        expect(delegated_attributes).to include(
          accessor_target: a_collection_containing_exactly(:a_column)
        )
      end

      it 'adds the columns, including delegated columns, to the set of parsed attributes' do
        expect(parsed_attributes).to include(:single_column, :accessor_target_a_column)
      end

      it 'correctly returns to the titleized attributes' do
        expect(titleized_attributes).to include('Single Column', 'Accessor Target A Column')
      end
    end
  end

  describe '#to_csv' do
    subject { serializer }
    it { is_expected.to respond_to(:to_csv) }
  end
end
# rubocop:enable Metrics/BlockLength

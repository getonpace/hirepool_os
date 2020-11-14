# frozen_string_literal: true

require 'rails_helper'

require 'serializers/to_csv/generator'
require 'serializers/to_csv/base_delegator'

require 'set'
require 'csv'

# rubocop:disable Metrics/BlockLength
RSpec.describe Serializers::ToCsv::Generator do
  let(:delegator) { Class.new(Serializers::ToCsv::BaseDelegator) }

  let(:parsed_attributes) do
    Array.new(Faker::Number.between(6, 12)) do
      Faker::Hipster.words(Faker::Number.between(1, 3)).join('_').to_sym
    end.to_set
  end

  let(:generator) do
    described_class.new(attributes: parsed_attributes, delegator: delegator)
  end

  describe 'default options' do
    subject(:defaults) { described_class::DEFAULT_OPTIONS }
    it { is_expected.to include(headers: true) }
    it { is_expected.to include(return_headers: true) }
  end

  describe 'instantiation' do
    it 'sets the headers' do
      expect(generator.headers).to all(be_a Symbol)
      expect(generator.headers).to eq(parsed_attributes)
    end

    it 'creates a resource_delegator' do
      expect(generator.send(:resource_delegator)).to be_a(Delegator)
      # expect(generator.send(:resource_delegator)).to be_a(Serializers::ToCsv::BaseDelegator)
    end

    it 'sets options to pass on to the CSV class' do
      expect(generator.options).not_to be_nil
    end

    context 'when no options specified' do
      subject(:instance_options) { generator.options }
      it { is_expected.to eq(described_class::DEFAULT_OPTIONS) }
    end

    context 'when headers are disabled' do
      let(:other_defaults) { described_class::DEFAULT_OPTIONS.except(:headers) }

      let(:generator) do
        described_class.new(
          attributes: parsed_attributes,
          delegator: delegator,
          headers: false
        )
      end

      subject(:instance_options) { generator.options }

      it { is_expected.to include(headers: false) }
      it { is_expected.to include(other_defaults) }
    end

    context 'when return_headers are disabled' do
      let(:other_defaults) { described_class::DEFAULT_OPTIONS.except(:return_headers) }

      let(:generator) do
        described_class.new(
          attributes: parsed_attributes,
          delegator: delegator,
          return_headers: false
        )
      end

      subject(:instance_options) { generator.options }

      it { is_expected.to include(return_headers: false) }
      it { is_expected.to include(other_defaults) }
    end

    context 'when header_converters are specified' do
      let(:generator) do
        described_class.new(
          attributes: parsed_attributes,
          delegator: delegator,
          header_converters: [
            :test_converter
          ]
        )
      end

      subject(:instance_options) { generator.options }

      it { is_expected.to include(header_converters: [:test_converter]) }
      it { is_expected.to include(described_class::DEFAULT_OPTIONS) }
    end

    context 'when extra options are specified' do
      let(:generator) do
        described_class.new(
          attributes: parsed_attributes,
          delegator: delegator,
          extra_option: 'importantOption'
        )
      end

      subject(:instance_options) { generator.options }

      it { is_expected.to include(described_class::DEFAULT_OPTIONS) }
      it { is_expected.to include(extra_option: 'importantOption') }
    end
  end

  describe '#serialize' do
    let(:serializable_collection) do
      (1..3).map do |i|
        # Generate some fake values that correspond to the parsed attributes
        values = Array.new(parsed_attributes.size) do
          Faker::Hipster.sentence(3, false, 6)
        end

        # Create a double that responds to the parsed attributes with fake values
        double("Serializable_#{i}", parsed_attributes.zip(values).to_h)
      end
    end

    let(:expected_headers) do
      parsed_attributes.map(&described_class::TitleConverter).join(',')
    end

    let(:resource_delegator) { generator.send(:resource_delegator) }

    let(:expected_rows) do
      serializable_collection.collect do |serializable|
        parsed_attributes.map(&serializable.method(:send)).join(',')
      end
    end

    it 'injects each element in the collection into the delegator' do
      serializable_collection.each do |obj|
        allow(resource_delegator).to receive(:__setobj__).with(obj).and_call_original
      end

      generator.serialize(serializable_collection)
    end

    it 'generates a CSV string' do
      expect(::CSV).to receive(:generate).and_call_original
      result = generator.serialize(serializable_collection)
      expect(result).to be_a(String)
    end

    it 'sets the headers' do
      generator.serialize(serializable_collection).tap do |result|
        # Split result into two at the first
        # newline, saving only the first row.
        actual_headers, = result.split("\n", 2)

        expect(actual_headers).to eq(expected_headers)
      end
    end

    it 'adds rows for each resource' do
      generator.serialize(serializable_collection).tap do |result|
        # Split result by newline, discarding the first
        # row and saving the remaining rows to an array.
        _, *actual_rows = result.split("\n")

        expect(actual_rows.size).to eq(serializable_collection.size)
        expect(actual_rows).to eq(expected_rows)
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength
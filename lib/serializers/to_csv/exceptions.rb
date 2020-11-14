# frozen_string_literal: true

module Serializers
  module ToCsv
    module Exceptions
      class ColumnDeclarationError < ::ArgumentError
        def initialize(msg = 'Invalid column attribute declaration')
          super(msg)
        end
      end

      class MultipleColumnDeclarationError < ColumnDeclarationError
      end

      class MultipleMappedColumnsError < ColumnDeclarationError
        def initialize(msg = 'Multiple mapped declarations')
          super(msg)
        end
      end

      class DuplicateDelegateColumnsError < ColumnDeclarationError
        def initialize(msg = 'Use either Array declaration or Hash declaration, but not both')
          super(msg)
        end
      end

      class NoDelegateMethodsError < ColumnDeclarationError
        def initialize(to = nil)
          msg = 'No columns specified to delegate to target'
          super(to.nil? ? msg : "#{msg}: '#{to}'")
        end
      end
    end
  end
end
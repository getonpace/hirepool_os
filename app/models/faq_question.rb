class FaqQuestion

  @@faq_questions_table = Rails.configuration.x.dynamodb.faq_questions_table

  def initialize(dynamoItem)
    @dynamoItem = dynamoItem
    @dynamo_client = Aws::DynamoDB::Client.new
  end

  def save
    create_dynamodb_table(@@faq_questions_table)
    begin
      @dynamo_client.put_item(:table_name => @@faq_questions_table, :item => @dynamoItem)
    rescue  Aws::DynamoDB::Errors::ServiceError => error
      puts "Unable to save FaqQuestion"
      puts "#{error.message}"
    end
  end

private
  def create_dynamodb_table(table_name)
    begin
      @dynamo_client.describe_table(:table_name => table_name)
    rescue Aws::DynamoDB::Errors::ResourceNotFoundException
      @dynamo_client.create_table(
        :table_name => table_name,
        :attribute_definitions => [{
            :attribute_name => :user_id,
            :attribute_type => :N
          }, {
            :attribute_name => :datetime,
            :attribute_type => :S
          }
        ],
        :key_schema => [{
            :attribute_name => :user_id,
            :key_type => :HASH
          }, {
            :attribute_name => :datetime,
            :key_type => :RANGE
          }
        ],
        :provisioned_throughput => {
          :read_capacity_units => 1,
          :write_capacity_units => 1,
        }
      )

      # wait for table to be created
      puts "waiting for table to be created..."
      @dynamo_client.wait_until(:table_exists, table_name: table_name)
      puts "table created!"
    end
  end

end

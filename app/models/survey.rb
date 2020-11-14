class Survey

  @@user_surveys_table = Rails.configuration.x.dynamodb.user_surveys_table

  def initialize(dynamoItem)
    @dynamoItem = dynamoItem
    @dynamo_client = Aws::DynamoDB::Client.new
  end

  def save
    create_dynamodb_table(@@user_surveys_table)
    begin
      @dynamo_client.put_item(:table_name => @@user_surveys_table, :item => @dynamoItem)
    rescue  Aws::DynamoDB::Errors::ServiceError => error
      puts "Unable to save Survey"
      puts "#{error.message}"
    end
  end

  def load(user_id)
    resp = @dynamo_client.query({
      table_name: @@user_surveys_table,
      key_condition_expression: "user_id = :uid",
      expression_attribute_values: {
        ":uid" => user_id,
      }
    })
    survey_to_return = {
      "datetime" => "2016-01-01T22:35:19Z"
    }
    resp.items.each {|item|
      if DateTime.strptime(survey_to_return["datetime"]) < DateTime.strptime(item["datetime"])
        survey_to_return = item
      end
    }
    survey_to_return
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
        },
        :sse_specification => {
          :enabled => true,
        },
      )

      # wait for table to be created
      puts "waiting for table to be created..."
      @dynamo_client.wait_until(:table_exists, table_name: table_name)
      puts "table created!"
    end
  end

end

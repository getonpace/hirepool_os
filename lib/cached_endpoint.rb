require 'aws-sdk'

module CachedEndpoint
  class DynamoCachedEndpoint
    attr_reader :ttl

    def initialize(model, ttl=(7*24*60*60), dynamo_client=Aws::DynamoDB::Client.new)
      @model = model
      @ttl = ttl
      @dynamo_client = dynamo_client
    end

    def get(dynamo_param, source_params)
      response = get_from_dynamo(@model, dynamo_param)

      if response.item.nil?
        # we didn't find in dynamo, try to set it and get it again
        puts "Did not find item in dynamo, try to cache it"
        set_then_get(dynamo_param, source_params)
      else
        # we got an item, check to see if we need to refresh it
        time_now = Time.now.to_i
        if time_now >= response.item["next_update_at"].to_i
          puts "Found item in dynamo, but need to update it"
          set_then_get(dynamo_param, source_params)
        else
          # just return response if we don't need to refresh it
          puts "Found item in dynamo"
          response
        end
      end
    end

    def get_all
      response = get_all_from_dynamo(@model)
    end

    def set(dynamo_param, source_params, force=false)
      source_data = get_source_data(@model, source_params)
      puts "got source data"
      puts source_data

      if source_data.nil?
        puts "No source_data retrieved!"
        return false
      else
        put_to_dynamo(@model, source_data, force)
        return true
      end
    end

    def set_then_get(dynamo_param, source_params)
      if set(dynamo_param, source_params)
        return get_from_dynamo(@model, dynamo_param)
      else
        return nil
      end
    end

    def refresh(dynamo_param, source_params)
      set(dynamo_param, source_params, true)
    end

    def get_source_data(model, source_params)
      source_data = model.get_source_data(source_params)
      raise TypeError, "Source data must be a Hash!" unless source_data.is_a? Hash or source_data.nil?
      source_data
    end

    private
      def get_all_from_dynamo(model)
        params = {
          :table_name => model::TABLE_NAME,
        }
        count = 0
        dynamoData = Array.new
        begin
          loop do
            count = count + 1
            puts "scanning dynamodb iteration: #{count.to_s}"
            result = @dynamo_client.scan(params)
            dynamoData.push(*result.items)
            break if result.last_evaluated_key.nil?
            params[:exclusive_start_key] = result.last_evaluated_key
          end
        rescue  Aws::DynamoDB::Errors::ServiceError => error
          puts "Unable to scan dynamodb table:"
          puts "#{error.message}"
        end
        dynamoData
      end

      def get_from_dynamo(model, param)
        response = @dynamo_client.get_item({
          :table_name => model::TABLE_NAME, # required
          :key => { # required
            model::PARTITION_KEY => param
          }
          # attributes_to_get: ["AttributeName"],
          # consistent_read: true,
        })

        response
      end

      def put_to_dynamo(model, data_to_store, force=false)
        # save the information in Dynamodb for the duration of the TTL and only
        # update dynamodb entry if it has been longer than the TTL since last
        # update
        time_now = Time.now.to_i
        next_update_at = time_now + @ttl # a week from now

        data_to_store["created_at"] = time_now
        data_to_store["next_update_at"] = next_update_at

        data_compacted = compact_mash(data_to_store, {:recurse=>true})

        put_params = {
          :table_name => model::TABLE_NAME,
          :item => data_compacted
        }

        if not force
          # taking out the time checking forces an update if item doesn't exist
          put_params = put_params.merge({
            :condition_expression => ":time_now >= #nua OR attribute_not_exists(#key)",
            :expression_attribute_names => {
              "#nua" => "next_update_at",
              "#key" => model::PARTITION_KEY,
            },
            :expression_attribute_values => {
              ":time_now" => time_now
            }
          })
        end

        begin
          @dynamo_client.put_item(put_params)
        rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
          puts "Put failed probably because it's not time to update the dynamodb item"
        end
      end

      # Used to remove nil and "" values from the Clearbit:Mash since DynamoDB doesn't like them
      def compact_mash(data_mash, opts={})
        data_mash.inject({}) do |new_hash, (k,v)|
          val = v
          if !val.nil? and val != ""
            if opts[:recurse]
              if val.class == Hash
                new_hash[k] = compact_mash(val, opts)
              elsif val.class == Array
                # compact each hash in array
                new_hash[k] = compact_arr(val, opts)
              else
                new_hash[k] = val
              end
            else
              new_hash[k] = val
            end
          end
          new_hash
        end
      end

      def compact_arr(data_arr, opts={})
        new_arr = []
        data_arr.each { |element|
          if opts[:recurse]
            if element.class == Array
              new_arr.push(compact_arr(element, opts))
            elsif element.class == Hash
              new_arr.push(compact_mash(element, opts))
            elsif !element.nil? and element != ""
              new_arr.push(element)
            end
          else
            new_arr.push(element)
          end
        }
        new_arr
      end
  end
end

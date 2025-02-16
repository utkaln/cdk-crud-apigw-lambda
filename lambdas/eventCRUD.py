import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
tableName = os.environ['TABLE_NAME']
eventTable = dynamodb.Table(tableName)

def handler(event, context):
    try:
        http_method = event['httpMethod']
        print(f"HTTP Method: {http_method}")
        # Create Resource
        if http_method == 'POST':
            data = json.loads(event['body'])
            eventTable.put_item(Item=data)
            print(f"Event created: {data}")
            return {
                'statusCode': 201,
                'body': json.dumps({'message': 'Event created successfully'})
            }
        # Read Resource
        elif http_method == 'GET':
            print(f"GET invoked : {str(event)}")
            # Read single record based on id
            if event['pathParameters'] and 'id' in event['pathParameters']:
                id = event['pathParameters']['id']
                print(f"Event ID in GET Single record: {id}")
                response = eventTable.get_item(Key={'pk': id})
                if 'Item' in response:
                    print(f"Event found: {response['Item']}")
                    return {
                        'statusCode': 200,
                        'body': json.dumps(response['Item'])
                    }
                else:
                    print(f"Event not found")
                    return {
                        'statusCode': 404,
                        'body': json.dumps({'message': 'Event not found'})
                    }
            # Read all records
            else:
                print("GET Reading all events")
                response = eventTable.scan()
                items = response['Items']
                print(f"Events found: {items}")
                if len(items) == 0:
                    return {
                        'statusCode': 404,
                        'body': json.dumps({'message': 'No events found'})
                    }
                return {
                    'statusCode': 200,
                    'body': json.dumps(items)
                }
        # Update Resource
        elif http_method == 'PATCH':
            data = json.loads(event['body'])
            print(f"Event data for PATCH: {data}")
            eventTable.patch_item(Item=data)
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Event updated successfully'})
            }
        
        # Delete Single Resource
        elif http_method == 'DELETE':
            id = event['pathParameters']['id']
            print(f"Event ID in DELETE: {id}")
            response = eventTable.delete_item(Key={'pk': id})
            return {
                'statusCode': 204, # No content
                'body': json.dumps({'message': 'Event deleted successfully'})
            }
        
        # Invalid HTTP Method
        else:
            print(f"Invalid HTTP Method: {http_method}")
            return {
                'statusCode': 405,
                'body': json.dumps({'message': 'Method Not Allowed'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f"Internal Server Error -> {str(e)}"})
        }
            

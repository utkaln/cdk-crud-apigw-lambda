import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    // Define Dynamo DB table for Event Registration
    const eventsTable = new dynamodb.Table(this,"EventsTable",{
      partitionKey: {name: "pk", type: dynamodb.AttributeType.STRING},
      sortKey: {name: "sk", type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Define a role for Lambda to access DDB
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // Assign role to DDB
    eventsTable.grantReadWriteData(lambdaRole);
    // Attach cloudwatch logs policy
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"));

    // Define events CRUD lambda function
    const eventsLambda = new lambda.Function(this, "eventsLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'eventCRUD.handler',
      code: lambda.Code.fromAsset("../lambdas"),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: eventsTable.tableName,
      },
    });

    // Define API Gateway for Events CRUD
    const eventsApi = new apigateway.LambdaRestApi(this, 'EventsAPI',{
      handler: eventsLambda,
      proxy: false,
    });

    //Define resource for api gateway
    const eventsResource = eventsApi.root.addResource("events");
    eventsResource.addMethod("POST", new apigateway.LambdaIntegration(eventsLambda)); 
    eventsResource.addMethod("GET", new apigateway.LambdaIntegration(eventsLambda));
    eventsResource.addMethod("PATCH", new apigateway.LambdaIntegration(eventsLambda));
    

    const singleResource = eventsApi.root.addResource(`{id}`);
    singleResource.addMethod("GET", new apigateway.LambdaIntegration(eventsLambda));
    singleResource.addMethod("DELETE", new apigateway.LambdaIntegration(eventsLambda));

    
  }
}

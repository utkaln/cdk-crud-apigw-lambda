# cdk-crud-apigw-lambda
CRUD Rest API using AWS API Gateway, AWS Lambda developed using CDK

## How to Build this project from nothing
- Install AWS CDK

#### Deploy the Stack
1. `cdk init --language typescript` 
2. Install CDK Libraries : `npm install aws-cdk-lib constructs`
3. Addition to infrastructure is done inside the file './cdk/lib/cdk-stack.ts'. Add Lambda definition here `const helloWorldFunction = new lambda.Function()...`
4. Define API Gateway Resource
5. Implement Lambda function outside cdk folder, say lambdas
6. Create `exports.handler` method inside lambda [getData.js](./lambdas/getData.js)

#### Commands to Build and Deploy
7. Create Cloud Env from CLI `cdk bootstrap` 
8. Build code `npm run build`
9. Synthesize code `cdk synth`
10. Deploy to cloud `cdk deploy`

#### Test Application
- Api gateway url : https://pny35h1knh.execute-api.us-east-1.amazonaws.com/prod/getData 

#### Delete Stack


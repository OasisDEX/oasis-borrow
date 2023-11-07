import * as path from 'path'
import { Construct } from 'constructs'
import {
  App,
  TerraformStack,
  // CloudBackend,
  // NamedCloudWorkspace,
  TerraformAsset,
  // AssetType,
  TerraformOutput,
} from 'cdktf'

import * as aws from '@cdktf/provider-aws'
import * as random from '@cdktf/provider-random'

interface LambdaFunctionConfig {
  path: string
  handler: string
  runtime: string
  version: string
}

const lambdaExecRolePolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'sts:AssumeRole',
      Principal: {
        Service: 'lambda.amazonaws.com',
      },
      Effect: 'Allow',
      Sid: '',
    },
  ],
}

class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name)

    new aws.provider.AwsProvider(this, 'AWS', {
      region: 'eu-north-1',
    })
    new random.provider.RandomProvider(this, 'random')

    // Create random value
    const pet = new random.pet.Pet(this, 'random-name', {
      length: 2,
    })

    // Create unique S3 bucket that hosts artifacts
    const bucket = new aws.s3Bucket.S3Bucket(this, 'artifacts', {
      bucketPrefix: `artifacts-${name}`,
    })

    // Create Lambda asset
    const lambdaAsset = new TerraformAsset(this, 'lambda-asset', {
      path: path.resolve(__dirname, config.path),
    })

    // Upload Lambda zip file to newly created S3 bucket
    const lambdaArchive = new aws.s3Object.S3Object(this, 'lambda-archive', {
      bucket: bucket.bucket,
      key: `${pet.id}/${lambdaAsset.fileName}`,
      source: lambdaAsset.path,
    })

    // Create Lambda role
    const role = new aws.iamRole.IamRole(this, 'lambda-exec', {
      name: `lambda-exec-${name}-${pet.id}`,
      assumeRolePolicy: JSON.stringify(lambdaExecRolePolicy),
    })

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(this, 'lambda-managed-policy', {
      policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      role: role.name,
    })

    // Create Lambda function
    const lambdaFunc = new aws.lambdaFunction.LambdaFunction(this, 'lambda', {
      functionName: `${name}-${pet.id}`,
      s3Bucket: bucket.bucket,
      s3Key: lambdaArchive.key,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
    })

    // Create and configure API gateway
    const api = new aws.apigatewayv2Api.Apigatewayv2Api(this, 'api-gw', {
      name: name,
      protocolType: 'HTTP',
      target: lambdaFunc.arn,
    })

    new aws.lambdaPermission.LambdaPermission(this, 'api-gw-lambda-invoke', {
      functionName: lambdaFunc.functionName,
      action: 'lambda:InvokeFunction',
      principal: 'apigateway.amazonaws.com',
      sourceArn: `${api.executionArn}/*/*`,
    })

    new TerraformOutput(this, 'url', {
      value: api.apiEndpoint,
    })
  }
}

const app = new App()
new LambdaStack(app, 'portfolio-positions-2', {
  path: '../lambdas/artifacts/portfolio-positions.zip',
  handler: 'dist/portfolio-positions/index.handler',
  runtime: 'nodejs18.x',
  version: 'v0.0.7',
})

// new CloudBackend(stack, {
//   hostname: 'app.terraform.io',
//   organization: 'Oazo',
//   workspaces: new NamedCloudWorkspace('borrow-infra'),
// })

app.synth()

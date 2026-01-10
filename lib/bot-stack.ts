/**
 * AWS CDK Stack for Discord Bot
 *
 * Core infrastructure:
 * - Lambda function for handling Discord interactions
 * - API Gateway for Discord webhook endpoint
 * - Self-invocation permission for deferred processing
 *
 * Optional features (via props):
 * - EventBridge for async events and scheduled tasks
 */
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';
import { EventBridgeIntegration } from './eventbridge';

export interface BotStackProps extends cdk.StackProps {
  /** Enable EventBridge for async events and scheduled tasks */
  enableEventBridge?: boolean;
}

export class BotStack extends cdk.Stack {
  /** The Discord interactions endpoint URL */
  public readonly interactionsUrl: string;

  /** The main Lambda handler */
  public readonly handler: lambda.Function;

  /** EventBridge integration (if enabled) */
  public readonly eventBridge?: EventBridgeIntegration;

  constructor(scope: Construct, id: string, props?: BotStackProps) {
    super(scope, id, props);

    // Lambda function for handling Discord interactions
    this.handler = new nodejs.NodejsFunction(this, 'DiscordHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/index.ts'),
      timeout: cdk.Duration.seconds(300), // 5 minutes for LLM processing
      memorySize: 512,
      environment: {
        // Discord configuration
        DISCORD_BOT_PUBLIC_KEY: process.env.DISCORD_BOT_PUBLIC_KEY || '',
        DISCORD_BOT_SECRET_TOKEN: process.env.DISCORD_BOT_SECRET_TOKEN || '',
        DISCORD_APP_ID: process.env.DISCORD_APP_ID || '',

        // LLM configuration
        DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER || 'gemini',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // Allow Lambda to invoke itself for async deferred processing
    this.handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [`arn:aws:lambda:${this.region}:${this.account}:function:BotStack-*`],
    }));

    // Allow Lambda to read/write SSM parameters (for config, cheaper than Secrets Manager)
    this.handler.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:PutParameter',
      ],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/discord-bot/*`],
    }));

    // API Gateway for Discord webhook
    const api = new apigateway.RestApi(this, 'BotApi', {
      restApiName: 'Discord Bot API',
      description: 'API for Discord bot interactions',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Add /interactions endpoint
    const interactions = api.root.addResource('interactions');
    interactions.addMethod(
      'POST',
      new apigateway.LambdaIntegration(this.handler)
    );

    this.interactionsUrl = `${api.url}interactions`;

    // Optional: EventBridge integration
    if (props?.enableEventBridge) {
      this.eventBridge = new EventBridgeIntegration(this, 'EventBridge', {
        handler: this.handler,
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'InteractionsUrl', {
      value: this.interactionsUrl,
      description: 'Discord Interactions Endpoint URL - paste this in Discord Developer Portal',
      exportName: 'DiscordInteractionsUrl',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.handler.functionName,
      description: 'Lambda function name for logs and debugging',
    });

    if (this.eventBridge) {
      new cdk.CfnOutput(this, 'EventBusName', {
        value: this.eventBridge.eventBus.eventBusName,
        description: 'EventBridge bus name for custom events',
      });
    }
  }
}

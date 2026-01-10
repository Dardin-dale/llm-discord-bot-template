#!/usr/bin/env node
/**
 * CDK App entry point
 */
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BotStack } from '../lib/bot-stack';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = new cdk.App();

new BotStack(app, 'BotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.AWS_REGION || 'us-west-2',
  },
  description: 'Discord Bot Template - Serverless Discord bot on AWS Lambda',

  // Optional features - set via environment or CDK context
  enableEventBridge: process.env.ENABLE_EVENTBRIDGE === 'true',
});

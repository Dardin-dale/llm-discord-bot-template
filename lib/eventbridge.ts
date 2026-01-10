/**
 * EventBridge Integration for Discord Bot
 *
 * Provides optional event-driven features:
 * - Custom event bus for bot events
 * - Notification Lambda for Discord webhooks
 * - Scheduled task support (cron/rate expressions)
 *
 * Use cases:
 * - Operations longer than 15 minutes
 * - Scheduled tasks (daily summaries, reminders)
 * - Decoupled notifications
 */
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export interface EventBridgeIntegrationProps {
  /** The main bot handler Lambda */
  handler: lambda.Function;
}

export class EventBridgeIntegration extends Construct {
  /** Custom event bus for bot events */
  public readonly eventBus: events.EventBus;

  /** Notification Lambda for Discord webhooks */
  public readonly notificationHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: EventBridgeIntegrationProps) {
    super(scope, id);

    // Create custom event bus for bot events
    this.eventBus = new events.EventBus(this, 'BotEventBus', {
      eventBusName: 'discord-bot-events',
    });

    // Notification Lambda - handles EventBridge events and sends to Discord
    this.notificationHandler = new nodejs.NodejsFunction(this, 'NotificationHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/events/notification-handler.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        DISCORD_BOT_SECRET_TOKEN: process.env.DISCORD_BOT_SECRET_TOKEN || '',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // Allow notification handler to read SSM parameters (for webhook URLs)
    this.notificationHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/discord-bot/*`],
    }));

    // Allow main handler to put events to the bus
    props.handler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['events:PutEvents'],
      resources: [this.eventBus.eventBusArn],
    }));

    // Rule: Bot notifications -> Notification Lambda
    new events.Rule(this, 'NotificationRule', {
      eventBus: this.eventBus,
      eventPattern: {
        source: ['discord-bot'],
        detailType: ['notification'],
      },
      targets: [new targets.LambdaFunction(this.notificationHandler)],
    });

    // Example: Scheduled task rule (uncomment and customize)
    // new events.Rule(this, 'DailyTaskRule', {
    //   schedule: events.Schedule.cron({ hour: '9', minute: '0' }), // 9 AM UTC daily
    //   targets: [new targets.LambdaFunction(props.handler, {
    //     event: events.RuleTargetInput.fromObject({
    //       type: 'scheduled_task',
    //       task: 'daily_summary',
    //     }),
    //   })],
    // });
  }

  /**
   * Add a scheduled task rule
   */
  public addScheduledTask(
    id: string,
    schedule: events.Schedule,
    taskName: string,
    targetHandler: lambda.Function
  ): events.Rule {
    return new events.Rule(this, id, {
      schedule,
      targets: [new targets.LambdaFunction(targetHandler, {
        event: events.RuleTargetInput.fromObject({
          type: 'scheduled_task',
          task: taskName,
        }),
      })],
    });
  }
}

---
name: deploy-bot
description: Deploy the Discord bot to AWS. Use when the user wants to deploy, push to production, publish the bot, or make changes live.
---

# Deploy Discord Bot

Build, validate, and deploy the bot to AWS.

## Instructions

Follow these steps in order, stopping if any step fails:

### 1. Validate Environment
```bash
npm run validate:env
```
If this fails, help the user set the missing environment variables in `.env`.

### 2. Build TypeScript
```bash
npm run build
```
If this fails, fix the TypeScript errors before continuing.

### 3. Run Tests
```bash
npm test
```
If tests fail, ask if they want to fix them or continue anyway.

### 4. Deploy to AWS
```bash
npx cdk deploy --require-approval never
```
This deploys the Lambda function and API Gateway.

### 5. Register Commands
```bash
npm run register
```
This updates Discord with any new/changed commands.

### 6. Report Results

Tell the user:
- Deployment succeeded
- API Gateway URL (from CDK output)
- If first deploy: Remind them to set Interactions Endpoint URL in Discord Developer Portal
- Commands registered

## Common Issues

**AWS credentials not configured:**
```bash
aws configure
```

**CDK not bootstrapped:**
```bash
npx cdk bootstrap
```

**Missing environment variables:**
Check `.env` has all required variables (see `.env.example`)

## First-Time Deploy Checklist

1. AWS CLI configured with credentials
2. CDK bootstrapped in the region
3. All `.env` variables set
4. Discord application created at discord.com/developers
5. Bot invited to server with `applications.commands` scope

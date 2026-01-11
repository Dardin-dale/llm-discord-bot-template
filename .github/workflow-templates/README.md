# GitHub Actions Templates

These are CI/CD workflow templates for your Discord bot. They're not active by default.

## To Enable CI/CD

1. Create the workflows directory:
   ```bash
   mkdir -p .github/workflows
   ```

2. Copy the workflows you want:
   ```bash
   cp .github/workflow-templates/pr.yml .github/workflows/
   cp .github/workflow-templates/deploy.yml .github/workflows/
   ```

3. Configure GitHub Secrets in your repo (Settings → Secrets → Actions):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `DISCORD_APP_ID`
   - `DISCORD_BOT_SECRET_TOKEN`
   - `DISCORD_BOT_PUBLIC_KEY`

4. Commit and push the workflows.

## What Each Workflow Does

**pr.yml** - Runs on pull requests:
- Type checks the code
- Runs tests
- Validates command structure

**deploy.yml** - Runs when you push to main:
- Builds the project
- Deploys to AWS
- Registers Discord commands

## Or Just Ask Claude

Tell Claude Code: *"Help me set up CI/CD"* and it will walk you through it.

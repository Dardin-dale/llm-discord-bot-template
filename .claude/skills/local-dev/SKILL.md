---
name: local-dev
description: Start local development server. Use when the user wants to test locally, run the bot on their machine, debug, or develop without deploying.
---

# Local Development

Start a local development server for testing the Discord bot.

## Instructions

### 1. Check Environment
Verify `.env` has:
- `DISCORD_BOT_PUBLIC_KEY`
- `DISCORD_APP_ID`
- `DISCORD_BOT_SECRET_TOKEN`

### 2. Start Local Server
```bash
npm run dev
```
This starts an Express server on port 3000.

### 3. Expose with ngrok

In a separate terminal:
```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4. Configure Discord

1. Go to Discord Developer Portal
2. Select your application
3. Go to General Information
4. Set "Interactions Endpoint URL" to: `<ngrok-url>/interactions`
5. Save Changes

Discord will verify the endpoint. If it fails, check the local server logs.

### 5. Test

Use your commands in Discord. Check the terminal for logs.

## Tips

- ngrok URL changes on restart (unless paid plan)
- Local changes apply immediately
- Use Ctrl+C to stop the server
- Check terminal for detailed request/response logs

## Common Issues

**Discord verification fails:**
- Is the local server running?
- Is ngrok running and connected?
- Check `DISCORD_BOT_PUBLIC_KEY` matches Discord portal

**Commands not responding:**
- Check terminal for errors
- Verify environment variables are loaded
- Make sure commands are registered

**Port already in use:**
```bash
# Find what's using port 3000
lsof -i :3000
# Kill it or use a different port
PORT=3001 npm run dev
```

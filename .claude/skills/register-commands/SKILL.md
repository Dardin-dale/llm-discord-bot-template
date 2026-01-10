---
name: register-commands
description: Register Discord slash commands. Use when the user added a new command, commands aren't showing up, or needs to update Discord with changes.
---

# Register Discord Commands

Register slash commands with the Discord API.

## Instructions

### 1. Check Environment
Verify these are set in `.env`:
- `DISCORD_APP_ID` (required)
- `DISCORD_BOT_SECRET_TOKEN` (required)
- `DISCORD_SERVER_ID` (optional, for instant updates)

### 2. Validate Commands
```bash
npm run validate
```
Fix any command structure issues before registering.

### 3. Register
```bash
npm run register
```

### 4. Report Results

Tell the user:
- Which commands were registered
- If `DISCORD_SERVER_ID` is set: Commands available immediately in that server
- If not set: Global commands take up to 1 hour to appear

## Troubleshooting

**Commands not appearing:**
- Did you run `npm run register`?
- Is `DISCORD_SERVER_ID` set for development?
- Try kicking and re-inviting the bot with `applications.commands` scope

**401 Unauthorized:**
- Check `DISCORD_BOT_SECRET_TOKEN` is correct
- Token should not have "Bot " prefix in `.env`

**Missing application ID:**
- Set `DISCORD_APP_ID` in `.env`
- Find it in Discord Developer Portal → Application → General Information

## Development vs Production

**Development** (instant updates):
```env
DISCORD_SERVER_ID=your_test_server_id
```

**Production** (global, 1 hour delay):
```env
# Remove or comment out DISCORD_SERVER_ID
# DISCORD_SERVER_ID=
```

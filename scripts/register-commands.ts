/**
 * Register Discord Slash Commands
 *
 * Run this after deployment to register your commands with Discord.
 * Usage: npm run register
 *
 * If DISCORD_SERVER_ID is set, commands register instantly to that server.
 * Otherwise, commands register globally (takes up to 1 hour to propagate).
 */
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import dotenv from 'dotenv';
import { getCommandDefinitions } from '../src/commands/loader';

dotenv.config();

async function registerCommands(): Promise<void> {
  const token = process.env.DISCORD_BOT_SECRET_TOKEN;
  const appId = process.env.DISCORD_APP_ID;
  const serverId = process.env.DISCORD_SERVER_ID;

  if (!token) {
    console.error('Error: DISCORD_BOT_SECRET_TOKEN is not set');
    process.exit(1);
  }

  if (!appId) {
    console.error('Error: DISCORD_APP_ID is not set');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Loading commands...');
    const commands = await getCommandDefinitions();
    console.log(`Found ${commands.length} commands to register`);

    if (serverId) {
      // Register to specific server (instant)
      console.log(`Registering commands to server ${serverId}...`);
      await rest.put(Routes.applicationGuildCommands(appId, serverId), {
        body: commands,
      });
      console.log('Commands registered to server! They should appear immediately.');
    } else {
      // Register globally (takes up to 1 hour)
      console.log('Registering commands globally...');
      await rest.put(Routes.applicationCommands(appId), {
        body: commands,
      });
      console.log('Commands registered globally! They may take up to 1 hour to appear.');
    }

    console.log('\nRegistered commands:');
    commands.forEach((cmd) => {
      console.log(`  /${cmd.name} - ${cmd.description}`);
    });
  } catch (error) {
    console.error('Failed to register commands:', error);
    process.exit(1);
  }
}

registerCommands();

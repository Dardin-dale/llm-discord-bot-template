/**
 * Command Template
 *
 * Copy this file to create a new command.
 * Rename it to your command name (e.g., weather.ts)
 *
 * The command will be auto-loaded - no registration needed!
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';

const command: Command = {
  // Command name (must match the name in definition)
  name: 'template',

  // Short description for the command list
  description: 'Template command - copy this to create new commands',

  // Full command definition for Discord
  definition: new SlashCommandBuilder()
    .setName('template')
    .setDescription('Template command - copy this to create new commands')
    // Add options here:
    // .addStringOption(option =>
    //   option.setName('input')
    //     .setDescription('Your input')
    //     .setRequired(true)
    // )
    .toJSON(),

  // Execute the command - runs when user invokes the command
  async execute(interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    // For instant responses:
    return {
      type: 'instant',
      content: 'Hello from the template command!',
      // ephemeral: true,  // Uncomment to make response only visible to user
    };

    // For deferred responses (async processing):
    // return { type: 'deferred' };
  },

  // Optional: Process deferred command
  // This runs asynchronously after returning { type: 'deferred' }
  // async processDeferred(interaction: APIChatInputApplicationCommandInteraction): Promise<void> {
  //   const applicationId = process.env.DISCORD_APP_ID || interaction.application_id;
  //   const { editOriginalResponse } = await import('../discord/responses');
  //
  //   // Do async work here (LLM calls, API requests, etc.)
  //   const result = await someAsyncOperation();
  //
  //   // Send the result back to Discord
  //   await editOriginalResponse(applicationId, interaction.token, result);
  // },
};

export default command;

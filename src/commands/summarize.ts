/**
 * Summarize Command
 *
 * Summarize text using the summarize skill.
 * Example of using the skills system.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { sendLongMessage } from '../discord/message-utils';
import { editOriginalResponse } from '../discord/responses';
import { runPrompt } from '../llm/prompts';
import { logger } from '../utils/logger';

const command: Command = {
  name: 'summarize',
  description: 'Summarize text into key points',

  definition: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize text into key points')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The text to summarize')
        .setRequired(true)
    )
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    return { type: 'deferred' };
  },

  async processDeferred(interaction: APIChatInputApplicationCommandInteraction): Promise<void> {
    const applicationId = process.env.DISCORD_APP_ID || interaction.application_id;
    const startTime = Date.now();

    try {
      const textOption = interaction.data.options?.find((opt) => opt.name === 'text');
      if (!textOption || textOption.type !== 3) {
        await editOriginalResponse(applicationId, interaction.token, 'Please provide text to summarize.');
        return;
      }

      const text = textOption.value as string;

      logger.info('Running summarize prompt', {
        command: 'summarize',
        userId: interaction.member?.user?.id,
        serverId: interaction.guild_id,
      });

      const result = await runPrompt('summarize', { text });

      logger.command('summarize', 'complete', {
        durationMs: Date.now() - startTime,
        provider: result.provider,
      });

      await sendLongMessage(applicationId, interaction.token, result.response);
    } catch (error) {
      logger.error('Summarize command failed', error as Error, { command: 'summarize' });
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'Sorry, I encountered an error while summarizing.'
      );
    }
  },
};

export default command;

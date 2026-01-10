/**
 * Explain Command
 *
 * Explain a concept in simple terms using the explain skill.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { sendLongMessage } from '../discord/message-utils';
import { editOriginalResponse } from '../discord/responses';
import { runPrompt } from '../llm/prompts';
import { logger } from '../utils/logger';

const command: Command = {
  name: 'explain',
  description: 'Explain a concept in simple terms',

  definition: new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Explain a concept in simple terms')
    .addStringOption((option) =>
      option
        .setName('topic')
        .setDescription('The topic or concept to explain')
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
      const topicOption = interaction.data.options?.find((opt) => opt.name === 'topic');
      if (!topicOption || topicOption.type !== 3) {
        await editOriginalResponse(applicationId, interaction.token, 'Please provide a topic to explain.');
        return;
      }

      const topic = topicOption.value as string;

      logger.info('Running explain prompt', {
        command: 'explain',
        userId: interaction.member?.user?.id,
      });

      const result = await runPrompt('explain', { topic });

      logger.command('explain', 'complete', {
        durationMs: Date.now() - startTime,
        provider: result.provider,
      });

      await sendLongMessage(applicationId, interaction.token, result.response);
    } catch (error) {
      logger.error('Explain command failed', error as Error, { command: 'explain' });
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'Sorry, I encountered an error while explaining.'
      );
    }
  },
};

export default command;

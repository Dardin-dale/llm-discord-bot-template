/**
 * Ask Command
 *
 * Ask the AI a question using the configured LLM provider.
 * Example of a deferred response command with LLM integration.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { editOriginalResponse } from '../discord/responses';
import { getProviderManager } from '../llm/provider';

const command: Command = {
  name: 'ask',
  description: 'Ask the AI a question',

  definition: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI a question')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('Your question for the AI')
        .setRequired(true)
    )
    .toJSON(),

  async execute(_interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    // Return deferred response - processing happens in processDeferred
    return { type: 'deferred' };
  },

  async processDeferred(interaction: APIChatInputApplicationCommandInteraction): Promise<void> {
    const applicationId = process.env.DISCORD_APP_ID || interaction.application_id;

    try {
      // Get the question from options
      const question = interaction.data.options?.find(
        (opt) => opt.name === 'question'
      );

      if (!question || question.type !== 3) {
        await editOriginalResponse(
          applicationId,
          interaction.token,
          'Please provide a question.'
        );
        return;
      }

      const questionText = question.value as string;

      // Get the LLM provider and generate response
      const provider = getProviderManager().getProvider();
      const response = await provider.generate(questionText);

      // Send the response back to Discord
      await editOriginalResponse(applicationId, interaction.token, response);
    } catch (error) {
      console.error('Error in ask command:', error);
      await editOriginalResponse(
        applicationId,
        interaction.token,
        'Sorry, I encountered an error while processing your question.'
      );
    }
  },
};

export default command;

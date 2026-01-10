/**
 * Provider Command
 *
 * Check and switch between LLM providers (Gemini, Claude).
 * Gracefully handles unconfigured providers.
 */
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, CommandResult } from '../discord/types';
import { getProviderManager } from '../llm/provider';

const command: Command = {
  name: 'provider',
  description: 'Check or switch the AI provider',

  definition: new SlashCommandBuilder()
    .setName('provider')
    .setDescription('Check or switch the AI provider')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('Show current provider and available options')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Switch to a different provider')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Provider to switch to')
            .setRequired(true)
            .addChoices(
              { name: 'Gemini (Google)', value: 'gemini' },
              { name: 'Claude (Anthropic)', value: 'claude' }
            )
        )
    )
    .toJSON(),

  async execute(interaction: APIChatInputApplicationCommandInteraction): Promise<CommandResult> {
    const subcommand = interaction.data.options?.[0];

    if (!subcommand || subcommand.type !== 1) {
      return {
        type: 'instant',
        content: 'Invalid command usage.',
        ephemeral: true,
      };
    }

    const manager = getProviderManager();
    const available = manager.getAvailableProviders();
    const current = manager.getCurrentProvider();

    // Handle /provider status
    if (subcommand.name === 'status') {
      if (available.length === 0) {
        return {
          type: 'instant',
          embeds: [{
            title: 'AI Provider Status',
            description: 'No providers are configured.',
            color: 0xED4245, // Red
            fields: [
              {
                name: 'How to Configure',
                value: 'Set `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` in your environment, then redeploy.',
              },
            ],
          }],
          ephemeral: true,
        };
      }

      const providerList = available.map((p) => {
        const isCurrent = p === current;
        const icon = isCurrent ? '✅' : '⚪';
        const label = p === 'gemini' ? 'Gemini (Google)' : 'Claude (Anthropic)';
        return `${icon} **${label}**${isCurrent ? ' (active)' : ''}`;
      }).join('\n');

      return {
        type: 'instant',
        embeds: [{
          title: 'AI Provider Status',
          description: providerList,
          color: 0x5865F2, // Discord blurple
          footer: {
            text: 'Use /provider set to switch providers',
          },
        }],
      };
    }

    // Handle /provider set
    if (subcommand.name === 'set') {
      const options = (subcommand as any).options;
      const nameOption = options?.find((o: any) => o.name === 'name');
      const newProvider = nameOption?.value as 'gemini' | 'claude';

      if (!newProvider) {
        return {
          type: 'instant',
          content: 'Please specify a provider name.',
          ephemeral: true,
        };
      }

      // Check if the requested provider is configured
      if (!available.includes(newProvider)) {
        const configVar = newProvider === 'gemini' ? 'GEMINI_API_KEY' : 'ANTHROPIC_API_KEY';
        const providerName = newProvider === 'gemini' ? 'Gemini' : 'Claude';

        return {
          type: 'instant',
          embeds: [{
            title: `${providerName} Not Configured`,
            description: `The ${providerName} provider is not available because its API key is not set.`,
            color: 0xED4245, // Red
            fields: [
              {
                name: 'How to Enable',
                value: `1. Set \`${configVar}\` in your \`.env\` file\n2. Run \`npm run deploy\`\n3. Try again!`,
              },
              {
                name: 'Available Providers',
                value: available.length > 0
                  ? available.map(p => `• ${p}`).join('\n')
                  : 'None configured',
              },
            ],
          }],
          ephemeral: true,
        };
      }

      // Check if already using this provider
      if (newProvider === current) {
        const providerName = newProvider === 'gemini' ? 'Gemini' : 'Claude';
        return {
          type: 'instant',
          content: `Already using ${providerName}!`,
          ephemeral: true,
        };
      }

      // Switch provider
      try {
        manager.setCurrentProvider(newProvider);
        const providerName = newProvider === 'gemini' ? 'Gemini' : 'Claude';

        return {
          type: 'instant',
          embeds: [{
            title: 'Provider Switched',
            description: `Now using **${providerName}** for AI responses.`,
            color: 0x57F287, // Green
          }],
        };
      } catch (error) {
        return {
          type: 'instant',
          content: 'Failed to switch provider. Please try again.',
          ephemeral: true,
        };
      }
    }

    return {
      type: 'instant',
      content: 'Unknown subcommand.',
      ephemeral: true,
    };
  },
};

export default command;

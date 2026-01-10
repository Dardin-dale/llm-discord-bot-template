/**
 * Command auto-loader
 *
 * Automatically discovers and loads commands from the commands directory.
 * Just drop a new command file here - no registration needed!
 */
import * as fs from 'fs';
import * as path from 'path';
import { Command } from '../discord/types';

let commandCache: Map<string, Command> | null = null;

/**
 * Load all commands from the commands directory
 */
export async function loadCommands(): Promise<Map<string, Command>> {
  if (commandCache) {
    return commandCache;
  }

  const commands = new Map<string, Command>();
  const commandsDir = __dirname;

  // Get all .ts and .js files (excluding loader and templates)
  const files = fs.readdirSync(commandsDir).filter((file) => {
    const isCode = file.endsWith('.ts') || file.endsWith('.js');
    const isLoader = file === 'loader.ts' || file === 'loader.js';
    const isTemplate = file.startsWith('_');
    return isCode && !isLoader && !isTemplate;
  });

  for (const file of files) {
    try {
      const filePath = path.join(commandsDir, file);
      const commandModule = require(filePath);
      const command: Command = commandModule.default || commandModule;

      if (command && command.name && typeof command.execute === 'function') {
        commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
      } else {
        console.warn(`Invalid command file: ${file} (missing name or execute)`);
      }
    } catch (error) {
      console.error(`Failed to load command from ${file}:`, error);
    }
  }

  commandCache = commands;
  return commands;
}

/**
 * Get a specific command by name
 */
export async function getCommand(name: string): Promise<Command | undefined> {
  const commands = await loadCommands();
  return commands.get(name);
}

/**
 * Get all command definitions for Discord registration
 */
export async function getCommandDefinitions(): Promise<Command['definition'][]> {
  const commands = await loadCommands();
  return Array.from(commands.values()).map((cmd) => cmd.definition);
}

/**
 * Clear the command cache (useful for hot reloading in development)
 */
export function clearCommandCache(): void {
  commandCache = null;
}

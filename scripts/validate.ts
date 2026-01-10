/**
 * Validate Commands Script
 *
 * Checks all commands for common issues before deployment.
 * Usage: npm run validate
 */
import * as fs from 'fs';
import * as path from 'path';

interface ValidationError {
  file: string;
  message: string;
}

async function validateCommands(): Promise<void> {
  const commandsDir = path.join(__dirname, '../src/commands');
  const errors: ValidationError[] = [];
  let commandCount = 0;

  console.log('Validating commands...\n');

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
      const command = commandModule.default || commandModule;

      // Check required fields
      if (!command.name) {
        errors.push({ file, message: 'Missing "name" field' });
      } else {
        // Validate name format
        if (!/^[a-z0-9-]+$/.test(command.name)) {
          errors.push({
            file,
            message: `Invalid name "${command.name}" - must be lowercase letters, numbers, and hyphens only`,
          });
        }
      }

      if (!command.description) {
        errors.push({ file, message: 'Missing "description" field' });
      }

      if (!command.definition) {
        errors.push({ file, message: 'Missing "definition" field' });
      }

      if (!command.execute) {
        errors.push({ file, message: 'Missing "execute" function' });
      } else if (typeof command.execute !== 'function') {
        errors.push({ file, message: '"execute" must be a function' });
      }

      // Check if deferred commands have processDeferred
      // This is a warning, not an error
      if (command.execute) {
        const executeStr = command.execute.toString();
        if (
          executeStr.includes("type: 'deferred'") &&
          !command.processDeferred
        ) {
          console.log(
            `  Warning: ${file} returns deferred but has no processDeferred handler`
          );
        }
      }

      commandCount++;
      console.log(`  /${command.name || '(unnamed)'} - ${file}`);
    } catch (error) {
      errors.push({
        file,
        message: `Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  console.log(`\nValidated ${commandCount} commands`);

  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach(({ file, message }) => {
      console.log(`  ${file}: ${message}`);
    });
    process.exit(1);
  } else {
    console.log('\nAll commands valid!');
  }
}

validateCommands().catch((error) => {
  console.error('Validation failed:', error);
  process.exit(1);
});

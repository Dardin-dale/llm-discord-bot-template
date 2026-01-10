/**
 * Pre-deploy Validation Script
 *
 * Checks that all required environment variables are set before deployment.
 * Run automatically before deploy, or manually with: npm run validate:env
 *
 * Prevents cryptic CDK errors by catching missing config early.
 */
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  hint?: string;
}

const ENV_VARS: EnvVar[] = [
  // Discord (required)
  {
    name: 'DISCORD_APP_ID',
    required: true,
    description: 'Discord Application ID',
    hint: 'Get from Discord Developer Portal -> General Information',
  },
  {
    name: 'DISCORD_BOT_PUBLIC_KEY',
    required: true,
    description: 'Discord bot public key for signature verification',
    hint: 'Get from Discord Developer Portal -> General Information',
  },
  {
    name: 'DISCORD_BOT_SECRET_TOKEN',
    required: true,
    description: 'Discord bot token',
    hint: 'Get from Discord Developer Portal -> Bot -> Reset Token',
  },

  // AWS (optional - uses default credentials if not set)
  {
    name: 'AWS_REGION',
    required: false,
    description: 'AWS region for deployment',
    hint: 'Defaults to us-west-2',
  },

  // LLM Providers (at least one recommended)
  {
    name: 'GEMINI_API_KEY',
    required: false,
    description: 'Google Gemini API key',
    hint: 'Get from https://aistudio.google.com/apikey (free tier available)',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic Claude API key',
    hint: 'Get from https://console.anthropic.com/',
  },

  // Optional features
  {
    name: 'DISCORD_SERVER_ID',
    required: false,
    description: 'Server ID for instant command registration',
    hint: 'Enables instant command updates during development',
  },
  {
    name: 'ENABLE_EVENTBRIDGE',
    required: false,
    description: 'Enable EventBridge for scheduled tasks',
    hint: 'Set to "true" to enable',
  },
];

function validateEnv(): boolean {
  console.log('\n🔍 Validating environment configuration...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      errors.push(`❌ ${envVar.name} - ${envVar.description}`);
      if (envVar.hint) {
        errors.push(`   Hint: ${envVar.hint}`);
      }
    }
  }

  // Check for at least one LLM provider
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;

  if (!hasGemini && !hasClaude) {
    warnings.push('⚠️  No LLM provider configured (GEMINI_API_KEY or ANTHROPIC_API_KEY)');
    warnings.push('   The /ask command will not work without an LLM provider.');
    warnings.push('   Recommendation: Set GEMINI_API_KEY (free tier available)');
  }

  // Check AWS credentials
  try {
    const hasAwsCreds = !!(
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_PROFILE ||
      process.env.AWS_SHARED_CREDENTIALS_FILE
    );

    if (!hasAwsCreds) {
      // Try to detect default credentials
      const { execSync } = require('child_process');
      try {
        execSync('aws sts get-caller-identity', { stdio: 'pipe' });
      } catch {
        warnings.push('⚠️  AWS credentials may not be configured');
        warnings.push('   Run: aws configure');
      }
    }
  } catch {
    // Ignore - just a warning
  }

  // Print results
  if (errors.length > 0) {
    console.log('Required variables missing:\n');
    errors.forEach((e) => console.log(`  ${e}`));
    console.log('\n');
  }

  if (warnings.length > 0) {
    console.log('Warnings:\n');
    warnings.forEach((w) => console.log(`  ${w}`));
    console.log('\n');
  }

  // Print configured variables
  console.log('Configuration status:\n');
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    const status = value ? '✅' : (envVar.required ? '❌' : '⚪');
    const masked = value ? '(set)' : '(not set)';
    console.log(`  ${status} ${envVar.name}: ${masked}`);
  }
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Validation failed. Please set the required variables in .env\n');
    console.log('Steps:');
    console.log('  1. Copy .env.example to .env');
    console.log('  2. Fill in the required values');
    console.log('  3. Run: source .env');
    console.log('  4. Try again: npm run deploy\n');
    return false;
  }

  console.log('✅ Environment configuration is valid!\n');
  return true;
}

// Run validation
const isValid = validateEnv();
process.exit(isValid ? 0 : 1);

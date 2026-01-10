/**
 * Scheduled Event Handler Template
 *
 * Use this for handling scheduled EventBridge events.
 * Requires ENABLE_EVENTBRIDGE=true in .env
 *
 * To add a schedule, edit lib/eventbridge.ts
 */

/**
 * Handle a scheduled task
 *
 * @param taskName - The task identifier from the EventBridge rule
 */
export async function handleScheduledTask(taskName: string): Promise<void> {
  console.log(`Running scheduled task: ${taskName}`);

  switch (taskName) {
    case 'daily_summary':
      await handleDailySummary();
      break;

    case 'cleanup':
      await handleCleanup();
      break;

    default:
      console.warn(`Unknown scheduled task: ${taskName}`);
  }
}

async function handleDailySummary(): Promise<void> {
  // TODO: Implement daily summary
  // - Fetch data from your sources
  // - Format a summary message
  // - Send to Discord via webhook

  console.log('Running daily summary...');
}

async function handleCleanup(): Promise<void> {
  // TODO: Implement cleanup task
  // - Clean old data
  // - Archive logs
  // - etc.

  console.log('Running cleanup...');
}

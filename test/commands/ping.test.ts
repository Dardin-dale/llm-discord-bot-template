/**
 * Tests for ping command
 */
import pingCommand from '../../src/commands/ping';

describe('ping command', () => {
  it('should have correct name and description', () => {
    expect(pingCommand.name).toBe('ping');
    expect(pingCommand.description).toBe('Check if the bot is online');
  });

  it('should return instant response type', async () => {
    const result = await pingCommand.execute({} as any);
    expect(result.type).toBe('instant');
  });

  it('should return pong message', async () => {
    const result = await pingCommand.execute({} as any);
    expect(result.content).toContain('Pong');
  });
});

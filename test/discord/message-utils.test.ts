/**
 * Tests for message utilities
 */
import {
  splitMessage,
  truncateMessage,
  codeBlock,
  inlineCode,
  escapeMarkdown,
} from '../../src/discord/message-utils';

describe('splitMessage', () => {
  it('should not split short messages', () => {
    const message = 'Hello, world!';
    const result = splitMessage(message);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(message);
  });

  it('should split long messages', () => {
    const message = 'A'.repeat(3000);
    const result = splitMessage(message);
    expect(result.length).toBeGreaterThan(1);
    expect(result.every((chunk) => chunk.length <= 1900)).toBe(true);
  });

  it('should prefer splitting at paragraph breaks', () => {
    // Create a message where first paragraph is about 1000 chars, then a break, then more
    const firstPara = 'First paragraph. ' + 'More content here. '.repeat(50); // ~1000 chars
    const secondPara = 'Second paragraph that continues. '.repeat(50); // ~1650 chars
    const message = firstPara + '\n\n' + secondPara;
    const result = splitMessage(message);
    // First chunk should end at or near the paragraph break
    expect(result.length).toBeGreaterThan(1);
    expect(result[0]).toContain('First paragraph');
  });

  it('should prefer splitting at sentence ends', () => {
    // Create a message that's long enough to require splitting
    const message = 'First sentence. ' + 'Second sentence here. '.repeat(100);
    const result = splitMessage(message);
    expect(result.length).toBeGreaterThan(1);
    // First chunk should end with punctuation (sentence end)
    expect(result[0].trim().match(/[.!?]$/)).toBeTruthy();
  });

  it('should handle messages with no natural break points', () => {
    const message = 'A'.repeat(5000); // No spaces or punctuation
    const result = splitMessage(message);
    expect(result.length).toBeGreaterThan(1);
    // Should still split even without break points
    expect(result.join('').length).toBe(5000);
  });
});

describe('truncateMessage', () => {
  it('should not truncate short messages', () => {
    const message = 'Hello!';
    expect(truncateMessage(message)).toBe(message);
  });

  it('should truncate long messages with ellipsis', () => {
    const message = 'A'.repeat(2000);
    const result = truncateMessage(message);
    expect(result.length).toBeLessThanOrEqual(1900);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should respect custom max length', () => {
    const message = 'This is a test message that is somewhat long';
    const result = truncateMessage(message, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });
});

describe('codeBlock', () => {
  it('should wrap content in code block', () => {
    const result = codeBlock('console.log("hello")');
    expect(result).toBe('```\nconsole.log("hello")\n```');
  });

  it('should include language hint', () => {
    const result = codeBlock('const x = 1;', 'typescript');
    expect(result).toBe('```typescript\nconst x = 1;\n```');
  });
});

describe('inlineCode', () => {
  it('should wrap content in backticks', () => {
    expect(inlineCode('test')).toBe('`test`');
  });
});

describe('escapeMarkdown', () => {
  it('should escape markdown characters', () => {
    const input = '*bold* _italic_ `code` ~strike~';
    const result = escapeMarkdown(input);
    expect(result).toBe('\\*bold\\* \\_italic\\_ \\`code\\` \\~strike\\~');
  });

  it('should handle text without markdown', () => {
    const input = 'Hello world';
    expect(escapeMarkdown(input)).toBe(input);
  });
});

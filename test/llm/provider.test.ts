/**
 * Tests for LLM provider manager
 */
import { LLMProviderManager } from '../../src/llm/provider';

describe('LLMProviderManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should default to gemini provider', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const manager = new LLMProviderManager();
    expect(manager.getCurrentProvider()).toBe('gemini');
  });

  it('should use specified default provider', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const manager = new LLMProviderManager('claude');
    expect(manager.getCurrentProvider()).toBe('claude');
  });

  it('should list available providers', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const manager = new LLMProviderManager();
    const available = manager.getAvailableProviders();
    expect(available).toContain('gemini');
    expect(available).toContain('claude');
  });

  it('should return empty list when no providers configured', () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const manager = new LLMProviderManager();
    expect(manager.getAvailableProviders()).toHaveLength(0);
  });

  it('should switch providers', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const manager = new LLMProviderManager('gemini');
    manager.setCurrentProvider('claude');
    expect(manager.getCurrentProvider()).toBe('claude');
  });

  it('should throw when switching to unconfigured provider', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.ANTHROPIC_API_KEY;
    const manager = new LLMProviderManager();
    expect(() => manager.setCurrentProvider('claude')).toThrow();
  });

  it('should throw when getting unconfigured provider', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.ANTHROPIC_API_KEY;
    const manager = new LLMProviderManager();
    expect(() => manager.getProvider('claude')).toThrow();
  });

  it('should return provider instance', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const manager = new LLMProviderManager();
    const provider = manager.getProvider();
    expect(provider).toBeDefined();
    expect(provider.name).toBe('gemini');
  });
});

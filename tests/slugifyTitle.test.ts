import { slugifyTitle } from '../src/utils/validators';

describe('slugifyTitle', () => {
  it('should convert string to lowercase', () => {
    expect(slugifyTitle('HELLO WORLD')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugifyTitle('hello world')).toBe('hello-world');
    expect(slugifyTitle('hello   world')).toBe('hello-world');
    expect(slugifyTitle('hello  world  test')).toBe('hello-world-test');
  });

  it('should remove non-alphanumeric characters except hyphens and underscores', () => {
    expect(slugifyTitle('hello@world!')).toBe('helloworld');
    expect(slugifyTitle('hello#world$')).toBe('helloworld');
    expect(slugifyTitle('hello-world_test')).toBe('hello-world_test');
  });

  it('should trim whitespace', () => {
    expect(slugifyTitle('  hello world  ')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugifyTitle('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(slugifyTitle('!@#$%^&*()')).toBe('');
  });

  it('should handle mixed case and special characters', () => {
    expect(slugifyTitle('Hello World! This is a Test.')).toBe('hello-world-this-is-a-test');
  });

  it('should preserve numbers', () => {
    expect(slugifyTitle('test123')).toBe('test123');
    expect(slugifyTitle('test 123')).toBe('test-123');
  });

  it('should handle consecutive special characters', () => {
    expect(slugifyTitle('hello!!!world???')).toBe('helloworld');
  });
});

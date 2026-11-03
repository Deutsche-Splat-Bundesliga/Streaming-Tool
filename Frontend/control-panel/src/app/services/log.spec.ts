import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { LogService } from './log';

describe('LogService', () => {
  let service: LogService;

  beforeEach(() => {
    service = new LogService();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a log entry with Info level', () => {
    service.info('test message', { a: 1 });

    expect(console.log).toHaveBeenCalledTimes(1);

    const [prefix, message, dataLabel, data] = vi.mocked(console.log).mock.calls[0];

    expect(prefix).toMatch(/^\[2025-01-01T00:00:00\.000Z\] \[Info\] \[.+:\d+\]$/);
    expect(message).toBe('test message');
    expect(dataLabel).toBe('Data:');
    expect(data).toEqual({ a: 1 });
  });

  it('should route Warning logs to console.warn', () => {
    service.warn('warn message');

    expect(console.warn).toHaveBeenCalledTimes(1);

    const [prefix] = vi.mocked(console.warn).mock.calls[0];
    expect(prefix).toMatch(/^\[2025-01-01T00:00:00\.000Z\] \[Warning\] \[.+:\d+\]$/);
  });

  it('should route Error logs to console.error', () => {
    service.error('error message', new Error('fail'));

    expect(console.error).toHaveBeenCalledTimes(1);

    const [prefix, message, errorLabel, error] = vi.mocked(console.error).mock.calls[0];

    expect(prefix).toMatch(/^\[2025-01-01T00:00:00\.000Z\] \[Error\] \[.+:\d+\]$/);
    expect(message).toBe('error message');
    expect(errorLabel).toBe('Error:');
    expect(error).toBeInstanceOf(Error);
  });

  it('should not clutter console output with scopes', () => {
    const scope = service.beginScope('TestScope');

    service.info('inside scope');

    expect(vi.mocked(console.log).mock.calls[0]).not.toContain('TestScope');

    scope.dispose();

    service.info('outside scope');

    expect(vi.mocked(console.log).mock.calls[1]).not.toContain('TestScope');
  });

  it('should support nested scopes (LIFO behavior)', () => {
    const scope1 = service.beginScope('Scope1');
    const scope2 = service.beginScope('Scope2');

    service.info('test');

    expect(vi.mocked(console.log).mock.calls[0]).not.toContain('Scope2');

    scope2.dispose();

    service.info('after pop');

    expect(vi.mocked(console.log).mock.calls[1]).not.toContain('Scope1');

    scope1.dispose();
  });

  it('should include timestamp in ISO format', () => {
    service.info('time test');

    const [prefix] = vi.mocked(console.log).mock.calls[0];
    expect(prefix).toContain('[2025-01-01T00:00:00.000Z]');
  });

  it('should pass error correctly in critical logs', () => {
    const err = new Error('critical fail');

    service.critical('critical issue', err, { x: 1 });

    const [, , dataLabel, data, errorLabel, error] = vi.mocked(console.error).mock.calls[0];
    expect(dataLabel).toBe('Data:');
    expect(data).toEqual({ x: 1 });
    expect(errorLabel).toBe('Error:');
    expect(error).toBe(err);
  });
});

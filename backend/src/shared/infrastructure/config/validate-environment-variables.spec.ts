import { validateEnvironmentVariables } from './validate-environment-variables';

describe('validateEnvironmentVariables', () => {
  it('passes through a well-formed config with types coerced', () => {
    const result = validateEnvironmentVariables({
      JWT_SECRET: 'a-secret-that-is-long-enough',
      PORT: '4000',
      EXPIRATION_TIMER: '3600',
    });

    expect(result.JWT_SECRET).toBe('a-secret-that-is-long-enough');
    expect(result.PORT).toBe(4000);
    expect(result.EXPIRATION_TIMER).toBe(3600);
  });

  it('passes when only the required JWT_SECRET is set', () => {
    const result = validateEnvironmentVariables({
      JWT_SECRET: 'a-secret-that-is-long-enough',
    });

    expect(result.PORT).toBeUndefined();
    expect(result.EXPIRATION_TIMER).toBeUndefined();
  });

  it('throws when JWT_SECRET is missing', () => {
    expect(() => validateEnvironmentVariables({})).toThrow();
  });

  it('throws when JWT_SECRET is shorter than the minimum length', () => {
    expect(() =>
      validateEnvironmentVariables({ JWT_SECRET: 'short' }),
    ).toThrow();
  });

  it('throws when PORT is not a number', () => {
    expect(() =>
      validateEnvironmentVariables({
        JWT_SECRET: 'a-secret-that-is-long-enough',
        PORT: 'not-a-number',
      }),
    ).toThrow();
  });

  it('throws when PORT is out of range', () => {
    expect(() =>
      validateEnvironmentVariables({
        JWT_SECRET: 'a-secret-that-is-long-enough',
        PORT: '70000',
      }),
    ).toThrow();
  });
});

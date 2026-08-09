import { validateEnvironmentVariables } from './validate-environment-variables';

describe('validateEnvironmentVariables', () => {
  const requiredDatabaseVars = {
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: '3307',
    DATABASE_NAME: 'todo-list',
    DATABASE_USER: 'root',
    DATABASE_PASSWORD: '0000',
  };

  it('passes through a well-formed config with types coerced', () => {
    const result = validateEnvironmentVariables({
      JWT_SECRET: 'a-secret-that-is-long-enough',
      PORT: '4000',
      EXPIRATION_TIMER: '3600',
      ...requiredDatabaseVars,
    });

    expect(result.JWT_SECRET).toBe('a-secret-that-is-long-enough');
    expect(result.PORT).toBe(4000);
    expect(result.EXPIRATION_TIMER).toBe(3600);
    expect(result.DATABASE_PORT).toBe(3307);
  });

  it('passes when only the required vars are set', () => {
    const result = validateEnvironmentVariables({
      JWT_SECRET: 'a-secret-that-is-long-enough',
      ...requiredDatabaseVars,
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

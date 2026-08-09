import { HashedPassword } from './hashed-password.vo';

describe('HashedPassword', () => {
  it('wraps and returns the given hashed value', () => {
    const hashed = HashedPassword.fromString('$2b$10$fakehash');

    expect(hashed.toString()).toBe('$2b$10$fakehash');
  });
});

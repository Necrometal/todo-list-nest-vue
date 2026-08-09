import { DomainError } from 'src/shared/domain/domain-error';
import { PlainPassword } from './plain-password.vo';

describe('PlainPassword', () => {
  it('accepts a password with letters, digits, length >= 8', () => {
    const password = PlainPassword.fromString('abcd1234');

    expect(password.toString()).toBe('abcd1234');
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(() => PlainPassword.fromString('ab1')).toThrow(DomainError);
  });

  it('rejects a password without a digit', () => {
    expect(() => PlainPassword.fromString('abcdefgh')).toThrow(DomainError);
  });

  it('rejects a password without a letter', () => {
    expect(() => PlainPassword.fromString('12345678')).toThrow(DomainError);
  });
});

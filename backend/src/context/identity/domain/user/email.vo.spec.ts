import { DomainError } from 'src/shared/domain/domain-error';
import { Email } from './email.vo';

describe('Email', () => {
  it('accepts a valid email', () => {
    const email = Email.fromString('user@example.com');

    expect(email.toString()).toBe('user@example.com');
  });

  it('rejects a value without @', () => {
    expect(() => Email.fromString('user-example.com')).toThrow(DomainError);
  });

  it('rejects a value without domain', () => {
    expect(() => Email.fromString('user@')).toThrow(DomainError);
  });

  it('rejects a value with spaces', () => {
    expect(() => Email.fromString('user @example.com')).toThrow(DomainError);
  });

  it('treats two emails with the same value as equal', () => {
    const a = Email.fromString('user@example.com');
    const b = Email.fromString('user@example.com');

    expect(a.equals(b)).toBe(true);
  });

  it('treats two emails with different values as not equal', () => {
    const a = Email.fromString('user@example.com');
    const b = Email.fromString('other@example.com');

    expect(a.equals(b)).toBe(false);
  });
});

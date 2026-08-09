import { DomainError } from 'src/shared/domain/domain-error';
import { ValueObject } from 'src/shared/domain/value-object';

// Practical shape check (local@domain.tld), not full RFC 5322 — that spec is
// notoriously over-permissive (allows quoted strings, comments...) and a
// stricter subset is what every real signup form actually enforces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends ValueObject<{ value: string }> {
  static fromString(value: string): Email {
    if (!EMAIL_PATTERN.test(value)) {
      throw new DomainError(`Invalid email format: "${value}"`);
    }
    return new Email({ value });
  }

  toString(): string {
    return this.props.value;
  }
}

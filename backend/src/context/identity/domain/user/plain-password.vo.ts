import { DomainError } from 'src/shared/domain/domain-error';
import { ValueObject } from 'src/shared/domain/value-object';

// Baseline policy for the boilerplate — tighten per project (e.g. add a
// special-char rule) without touching anything outside this file, since the
// rule is fully owned by the value object that enforces it.
const MIN_LENGTH = 8;
const HAS_LETTER_AND_DIGIT = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

export class PlainPassword extends ValueObject<{ value: string }> {
  static fromString(value: string): PlainPassword {
    if (value.length < MIN_LENGTH) {
      throw new DomainError(
        `Password must be at least ${MIN_LENGTH} characters long`,
      );
    }
    if (!HAS_LETTER_AND_DIGIT.test(value)) {
      throw new DomainError(
        'Password must contain at least one letter and one digit',
      );
    }
    return new PlainPassword({ value });
  }

  toString(): string {
    return this.props.value;
  }
}

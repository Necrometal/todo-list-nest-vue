import { ValueObject } from 'src/shared/domain/value-object';

export class HashedPassword extends ValueObject<{ value: string }> {
  static fromString(value: string): HashedPassword {
    return new HashedPassword({ value });
  }

  toString(): string {
    return this.props.value;
  }
}

import { v7 as randomUUID } from 'uuid';
import { ValueObject } from './value-object';

// Wraps a raw string id in a value object so entities compare/pass identity
// through a type ("Identifier"), never a bare, mistake-prone string.
export class Identifier extends ValueObject<{ value: string }> {
  // Protected: identifiers are only created via the two factories below,
  // never with an arbitrary/unvalidated string from outside.
  protected constructor(props: { value: string }) {
    super(props);
  }

  // v7 (time-ordered UUID) instead of v4: sorts roughly by creation time,
  // which keeps DB index inserts sequential instead of random.
  //
  // Returns `Identifier`, not `this` — a protected constructor can't be
  // expressed as a polymorphic `this`-returning factory in TS without the
  // signature falling apart at subclass call sites. Subtypes that need their
  // own id type (e.g. `UserIdentifier`) override both factories below
  // directly instead.
  static generate(): Identifier {
    return new Identifier({ value: randomUUID() });
  }

  // For rehydrating an entity from persistence, where the id already exists as a string.
  static fromString(value: string): Identifier {
    return new Identifier({ value });
  }

  toString(): string {
    return this.props.value;
  }
}

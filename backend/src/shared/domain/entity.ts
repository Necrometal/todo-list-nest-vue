import { Identifier } from './identifier';

// Base for any domain object whose identity matters more than its attribute values
// (two entities with the same id are "the same thing" even if other props differ).
export abstract class Entity<TProperties extends { id: Identifier }> {
  // Read-only so external code can inspect state but never swap the whole props object.
  readonly props: TProperties;

  // Protected: forces creation through named factory methods on subclasses
  // (e.g. `User.create(...)`) instead of a bare `new User(...)`.
  protected constructor(props: TProperties) {
    this.props = props;
  }

  // Returns `TProperties['id']`, not the base `Identifier` — so
  // `User.getIdentifier()` gives back a `UserIdentifier`, not a plain
  // `Identifier` that callers would have to cast to use.
  getIdentifier(): TProperties['id'] {
    return this.props.id;
  }

  equals(object: Entity<TProperties>): boolean {
    // Comparing against nothing is never equal; also guards optional/undefined callers.
    if (object === null || object === undefined) {
      return false;
    }

    // Same reference is always equal, skips the id comparison below.
    if (this === object) {
      return true;
    }

    // Identity is scoped to entity type: a User and an Order sharing the same
    // id value must never be considered equal.
    if (this.constructor !== object.constructor) {
      return false;
    }

    return this.getIdentifier().equals(object.getIdentifier());
  }
}

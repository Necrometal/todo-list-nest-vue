// Base for domain objects defined by their attribute values, not an identity
// (two value objects with the same props are interchangeable — e.g. Money, Email).
export abstract class ValueObject<T extends Record<string, unknown>> {
  // Read-only + copied on construction so a value object stays immutable after creation;
  // callers can't mutate one instance's props and silently affect every holder of it.
  readonly props: T;

  // Protected: force creation through named factory methods on subclasses
  // (e.g. `Email.create(...)`) so validation always runs before an instance exists.
  protected constructor(props: T) {
    this.props = {
      ...props,
    };
  }

  equals(vo: ValueObject<T>): boolean {
    // Comparing against nothing is never equal.
    if (vo === null || vo === undefined) {
      return false;
    }

    // Defensive: a malformed/partial value object has no props to compare.
    if (vo.props === undefined) {
      return false;
    }

    // Value objects have no identity, so equality is structural: same values = same object.
    // JSON.stringify is a simple stand-in for deep-equal — fine for flat primitive props,
    // revisit if a value object ever nests Dates or other non-JSON-stable types.
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

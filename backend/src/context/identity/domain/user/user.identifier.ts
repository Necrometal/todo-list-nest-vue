import { Identifier } from 'src/shared/domain/identifier';
import { v7 as randomUUID } from 'uuid';

// Overrides base factories to return `UserIdentifier` specifically. The base
// `Identifier.generate()`/`fromString()` return plain `Identifier` by design
// (see identifier.ts) — without these overrides, `UserIdentifier.generate()`
// would type-check as `Identifier`, and callers expecting a `UserIdentifier`
// (e.g. `User.register()`) would need a cast.
export class UserIdentifier extends Identifier {
  static override generate(): UserIdentifier {
    return new UserIdentifier({ value: randomUUID() });
  }

  static override fromString(value: string): UserIdentifier {
    return new UserIdentifier({ value });
  }
}

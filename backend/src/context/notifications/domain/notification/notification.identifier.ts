import { Identifier } from 'src/shared/domain/identifier';
import { v7 as randomUUID } from 'uuid';

// Same override pattern as UserIdentifier: without it, `.generate()`/
// `.fromString()` would type-check as the base `Identifier`, forcing a cast
// at every call site that expects a `NotificationIdentifier`.
export class NotificationIdentifier extends Identifier {
  static override generate(): NotificationIdentifier {
    return new NotificationIdentifier({ value: randomUUID() });
  }

  static override fromString(value: string): NotificationIdentifier {
    return new NotificationIdentifier({ value });
  }
}

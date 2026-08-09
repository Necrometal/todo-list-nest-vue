import { DomainEvent } from '../../domain/domain-event';

// Abstract class, not `interface`: survives to runtime as a Nest DI token —
// same pattern as PasswordHasher/TokenIssuer/UserRepository in the identity
// context. Lives in shared (not per-context) since DomainEvent itself is a
// shared-kernel type: any future context can depend on this port too.
export abstract class DomainEventPublisher {
  abstract publish(events: DomainEvent[]): Promise<void>;
}

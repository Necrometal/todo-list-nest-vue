import { Identifier } from './identifier';

// Base for "something happened" facts raised by an aggregate (e.g. UserRegistered).
// Kept in domain layer since the event describes a business occurrence, not infra plumbing.
export abstract class DomainEvent {
  constructor(
    // Which aggregate raised the event, so a handler can look it up without a payload field per event type.
    public readonly aggregateId: Identifier,
    // When it happened in the domain, independent of when it's later published/processed.
    public readonly occurredAt: Date,
  ) {}
}

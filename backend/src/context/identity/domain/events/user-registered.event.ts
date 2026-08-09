import { DomainEvent } from 'src/shared/domain/domain-event';
import { Email } from '../user/email.vo';
import { UserIdentifier } from '../user/user.identifier';

// Raised once, when a User is first registered. Carries the email alongside
// the inherited aggregateId so a handler (e.g. "send welcome email") can act
// without reloading the aggregate just to know who to email.
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    aggregateId: UserIdentifier,
    occurredAt: Date,
    public readonly email: Email,
  ) {
    super(aggregateId, occurredAt);
  }
}

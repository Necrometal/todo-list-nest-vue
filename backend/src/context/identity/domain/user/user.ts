import { AggregateRoot } from 'src/shared/domain/aggregate-root';
import { DomainError } from 'src/shared/domain/domain-error';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { Email } from './email.vo';
import { HashedPassword } from './hashed-password.vo';
import { UserStatus } from './user-status.enum';
import { UserIdentifier } from './user.identifier';

interface Properties {
  id: UserIdentifier;
  email: Email;
  password: HashedPassword;
  status: UserStatus;
}

// Which status a User may move to, given its current one. `deleted` has no
// outgoing entries: once deleted, a User is terminal and can never change
// state again — matches typical "soft delete is final" business rule.
const ALLOWED_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  [UserStatus.active]: [
    UserStatus.disabled,
    UserStatus.suspended,
    UserStatus.deleted,
  ],
  [UserStatus.disabled]: [UserStatus.active, UserStatus.deleted],
  [UserStatus.suspended]: [UserStatus.active, UserStatus.deleted],
  [UserStatus.deleted]: [],
};

export class User extends AggregateRoot<Properties> {
  // Entry point for creating a brand-new User (registration flow). Named
  // `register`, not `create`, to match the ubiquitous language already used
  // elsewhere in this context (RegisterUser use-case, UserRegisteredEvent).
  static register(
    id: UserIdentifier,
    email: Email,
    password: HashedPassword,
  ): User {
    const user = new User({ id, email, password, status: UserStatus.active });
    // Raised here, not in the use-case: registration itself is the business
    // fact — the use-case only orchestrates hashing/persistence around it.
    user.addDomainEvent(new UserRegisteredEvent(id, new Date(), email));
    return user;
  }

  // For rehydrating a User already stored (repository implementations call
  // this). No event raised: nothing "happened" here, we're just reloading
  // state that was already valid when first written.
  static fromPersistence(props: Properties): User {
    return new User(props);
  }

  getEmail(): Email {
    return this.props.email;
  }

  getPassword(): HashedPassword {
    return this.props.password;
  }

  getStatus(): UserStatus {
    return this.props.status;
  }

  suspend(): void {
    this.transitionTo(UserStatus.suspended);
  }

  activate(): void {
    this.transitionTo(UserStatus.active);
  }

  delete(): void {
    this.transitionTo(UserStatus.deleted);
  }

  disable(): void {
    this.transitionTo(UserStatus.disabled);
  }

  // Single choke point for every status change: guarantees none of the
  // methods above can silently apply an illegal transition (e.g. reactivating
  // a deleted user).
  private transitionTo(next: UserStatus): void {
    // Re-applying the current status is a no-op, not an error — callers
    // (e.g. an idempotent "disable" admin action) shouldn't need to check
    // current status before calling.
    if (this.props.status === next) {
      return;
    }

    if (!ALLOWED_TRANSITIONS[this.props.status].includes(next)) {
      throw new DomainError(
        `Cannot transition user from "${UserStatus[this.props.status]}" to "${UserStatus[next]}"`,
      );
    }

    this.props.status = next;
  }
}

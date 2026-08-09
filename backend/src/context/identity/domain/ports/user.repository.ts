import { Email } from '../user/email.vo';
import { User } from '../user/user';
import { UserIdentifier } from '../user/user.identifier';

// Named export (not default): keeps import statements consistent with every
// other domain class in this context, and default exports don't survive
// auto-rename/refactor tooling as reliably.
export abstract class UserRepository {
  abstract findById(id: UserIdentifier): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract save(user: User): Promise<void>;
}

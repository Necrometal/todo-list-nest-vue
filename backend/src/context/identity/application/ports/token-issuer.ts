import { UserIdentifier } from '../../domain/user/user.identifier';

// Abstract class for the same reason as PasswordHasher: needs to survive to
// runtime to serve as a Nest DI token (a bare `interface` doesn't).
export abstract class TokenIssuer {
  // Only `issue` for now — `verify` belongs to the guard/interface layer,
  // which doesn't exist yet. Add it there once a caller actually needs it.
  //
  // Takes the identifier only, not the full User: token issuance needs
  // identity alone, and a narrower input can't accidentally leak
  // email/password into a token payload later.
  abstract issue(userId: UserIdentifier): Promise<string>;
}

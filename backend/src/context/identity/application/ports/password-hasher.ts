import { HashedPassword } from '../../domain/user/hashed-password.vo';
import { PlainPassword } from '../../domain/user/plain-password.vo';

// Abstract class, not `interface`: a TS interface erases at compile time and
// can't be used as a Nest DI token. This survives to runtime, so infra
// (BcryptPasswordHasher, ...) can be bound to it in identity.module.ts —
// same pattern as the domain UserRepository port.
export abstract class PasswordHasher {
  abstract hash(plain: PlainPassword): Promise<HashedPassword>;

  // Returns a boolean rather than throwing: a mismatched password is an
  // expected outcome of authentication, not an exceptional one. The
  // use-case decides what to do with `false`.
  abstract compare(
    plain: PlainPassword,
    hashed: HashedPassword,
  ): Promise<boolean>;
}

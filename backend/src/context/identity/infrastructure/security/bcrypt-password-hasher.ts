import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher';
import { HashedPassword } from '../../domain/user/hashed-password.vo';
import { PlainPassword } from '../../domain/user/plain-password.vo';

// 10 rounds: bcrypt's own recommended floor, balances hashing cost against
// login latency. Bump later if hardware makes it cheap to brute-force.
const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  async hash(plain: PlainPassword): Promise<HashedPassword> {
    const hashed = await bcrypt.hash(plain.toString(), SALT_ROUNDS);
    return HashedPassword.fromString(hashed);
  }

  async compare(
    plain: PlainPassword,
    hashed: HashedPassword,
  ): Promise<boolean> {
    return bcrypt.compare(plain.toString(), hashed.toString());
  }
}

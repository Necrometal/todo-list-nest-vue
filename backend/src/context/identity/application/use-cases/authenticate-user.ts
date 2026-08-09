import { Injectable } from '@nestjs/common';
import { DomainError } from 'src/shared/domain/domain-error';
import { UserRepository } from '../../domain/ports/user.repository';
import { Email } from '../../domain/user/email.vo';
import { PlainPassword } from '../../domain/user/plain-password.vo';
import { UserStatus } from '../../domain/user/user-status.enum';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenIssuer } from '../ports/token-issuer';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthenticateUserOutput {
  token: string;
}

// Same message for "no such account" and "wrong password" — telling an
// attacker which one it was lets them enumerate registered emails.
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

@Injectable()
export class AuthenticateUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const email = Email.fromString(input.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new DomainError(INVALID_CREDENTIALS_MESSAGE);
    }

    const plainPassword = PlainPassword.fromString(input.password);
    const passwordMatches = await this.passwordHasher.compare(
      plainPassword,
      user.getPassword(),
    );
    if (!passwordMatches) {
      throw new DomainError(INVALID_CREDENTIALS_MESSAGE);
    }

    // Checked only after credentials are proven valid: revealing "this
    // account is suspended" to someone who doesn't know the password is the
    // same enumeration risk as above. Once they've proven ownership, it's safe.
    if (user.getStatus() !== UserStatus.active) {
      throw new DomainError('Account is not active');
    }

    const token = await this.tokenIssuer.issue(user.getIdentifier());
    return { token };
  }
}

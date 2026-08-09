import { Injectable } from '@nestjs/common';
import { DomainEventPublisher } from 'src/shared/application/ports/domain-event-publisher';
import { DomainError } from 'src/shared/domain/domain-error';
import { UserRepository } from '../../domain/ports/user.repository';
import { Email } from '../../domain/user/email.vo';
import { PlainPassword } from '../../domain/user/plain-password.vo';
import { User } from '../../domain/user/user';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { PasswordHasher } from '../ports/password-hasher';

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  userId: string;
}

@Injectable()
export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly domainEventPublisher: DomainEventPublisher,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // VOs validate shape as soon as they're built (see email.vo.ts /
    // plain-password.vo.ts) — malformed input throws DomainError here,
    // before any DB round-trip below.
    const email = Email.fromString(input.email);
    const plainPassword = PlainPassword.fromString(input.password);

    // Uniqueness needs a DB lookup, so it can't be enforced inside a value
    // object — it's an application-layer rule, not a domain-object invariant.
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainError('Email already registered');
    }

    // Plain text is hashed immediately and never reaches the aggregate or
    // persistence layer as-is.
    const hashedPassword = await this.passwordHasher.hash(plainPassword);

    // Id minted here, not by the DB, so the aggregate is fully formed and
    // valid before `save` is ever called.
    const id = UserIdentifier.generate();

    // Raises UserRegisteredEvent internally; pulled and published below.
    const user = User.register(id, email, hashedPassword);

    await this.userRepository.save(user);

    // Published only after save succeeds: a handler reacting to
    // "user registered" (e.g. welcome email) must never fire for a user
    // that didn't actually get persisted.
    await this.domainEventPublisher.publish(user.pullDomainEvents());

    return { userId: id.toString() };
  }
}

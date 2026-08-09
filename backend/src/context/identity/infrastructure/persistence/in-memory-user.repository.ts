/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/user.repository';
import { Email } from '../../domain/user/email.vo';
import { User } from '../../domain/user/user';
import { UserIdentifier } from '../../domain/user/user.identifier';

// Keyed by id string, not `Map<UserIdentifier, User>`: value-object instances
// with equal content aren't the same object reference, so they'd never hit as
// Map keys. The string value is the actual identity.
@Injectable()
export class InMemoryUserRepository extends UserRepository {
  private readonly users = new Map<string, User>();

  async findById(id: UserIdentifier): Promise<User | null> {
    return this.users.get(id.toString()) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getEmail().equals(email)) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getIdentifier().toString(), user);
  }
}

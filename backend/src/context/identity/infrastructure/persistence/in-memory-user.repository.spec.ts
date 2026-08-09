import { Email } from '../../domain/user/email.vo';
import { HashedPassword } from '../../domain/user/hashed-password.vo';
import { User } from '../../domain/user/user';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { InMemoryUserRepository } from './in-memory-user.repository';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('returns null when finding an id that was never saved', async () => {
    const result = await repository.findById(UserIdentifier.generate());

    expect(result).toBeNull();
  });

  it('returns null when finding an email that was never saved', async () => {
    const result = await repository.findByEmail(
      Email.fromString('user@example.com'),
    );

    expect(result).toBeNull();
  });

  it('saves a user and finds it back by id', async () => {
    const id = UserIdentifier.generate();
    const user = User.register(
      id,
      Email.fromString('user@example.com'),
      HashedPassword.fromString('$2b$10$fakehash'),
    );

    await repository.save(user);
    const found = await repository.findById(id);

    expect(found).toBe(user);
  });

  it('saves a user and finds it back by email value, not by VO reference', async () => {
    const id = UserIdentifier.generate();
    const user = User.register(
      id,
      Email.fromString('user@example.com'),
      HashedPassword.fromString('$2b$10$fakehash'),
    );

    await repository.save(user);
    // Different Email instance, same value — repository must compare
    // structurally (Email.equals), not by object reference.
    const found = await repository.findByEmail(
      Email.fromString('user@example.com'),
    );

    expect(found).toBe(user);
  });

  it('finds a user back by id value, not by Identifier reference', async () => {
    const id = UserIdentifier.generate();
    const user = User.register(
      id,
      Email.fromString('user@example.com'),
      HashedPassword.fromString('$2b$10$fakehash'),
    );

    await repository.save(user);
    // Rebuilt from the same string, not the same instance.
    const found = await repository.findById(
      UserIdentifier.fromString(id.toString()),
    );

    expect(found).toBe(user);
  });

  it('overwrites the previous record when saving the same id again', async () => {
    const id = UserIdentifier.generate();
    const original = User.register(
      id,
      Email.fromString('user@example.com'),
      HashedPassword.fromString('$2b$10$fakehash'),
    );
    await repository.save(original);

    const updated = User.fromPersistence({
      id,
      email: Email.fromString('user@example.com'),
      password: HashedPassword.fromString('$2b$10$fakehash'),
      status: original.getStatus(),
    });
    updated.suspend();
    await repository.save(updated);

    const found = await repository.findById(id);

    expect(found?.getStatus()).toBe(updated.getStatus());
  });
});

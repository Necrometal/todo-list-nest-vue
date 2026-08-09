import { DomainError } from 'src/shared/domain/domain-error';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { Email } from './email.vo';
import { HashedPassword } from './hashed-password.vo';
import { User } from './user';
import { UserStatus } from './user-status.enum';
import { UserIdentifier } from './user.identifier';

describe('User', () => {
  const id = UserIdentifier.generate();
  const email = Email.fromString('user@example.com');
  const password = HashedPassword.fromString('$2b$10$fakehash');

  describe('register', () => {
    it('creates an active user', () => {
      const user = User.register(id, email, password);

      expect(user.getStatus()).toBe(UserStatus.active);
      expect(user.getEmail()).toBe(email);
      expect(user.getPassword()).toBe(password);
      expect(user.getIdentifier()).toBe(id);
    });

    it('raises a UserRegisteredEvent carrying the id and email', () => {
      const user = User.register(id, email, password);

      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
      expect((events[0] as UserRegisteredEvent).aggregateId).toBe(id);
      expect((events[0] as UserRegisteredEvent).email).toBe(email);
    });
  });

  describe('fromPersistence', () => {
    it('rehydrates a user without raising an event', () => {
      const user = User.fromPersistence({
        id,
        email,
        password,
        status: UserStatus.suspended,
      });

      expect(user.getStatus()).toBe(UserStatus.suspended);
      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('status transitions', () => {
    it('allows active -> suspended', () => {
      const user = User.register(id, email, password);

      user.suspend();

      expect(user.getStatus()).toBe(UserStatus.suspended);
    });

    it('allows active -> disabled', () => {
      const user = User.register(id, email, password);

      user.disable();

      expect(user.getStatus()).toBe(UserStatus.disabled);
    });

    it('allows suspended -> active', () => {
      const user = User.fromPersistence({
        id,
        email,
        password,
        status: UserStatus.suspended,
      });

      user.activate();

      expect(user.getStatus()).toBe(UserStatus.active);
    });

    it('allows active -> deleted', () => {
      const user = User.register(id, email, password);

      user.delete();

      expect(user.getStatus()).toBe(UserStatus.deleted);
    });

    it('is a no-op when re-applying the current status', () => {
      const user = User.register(id, email, password);

      expect(() => user.activate()).not.toThrow();
      expect(user.getStatus()).toBe(UserStatus.active);
    });

    it('rejects any transition out of deleted (terminal state)', () => {
      const user = User.fromPersistence({
        id,
        email,
        password,
        status: UserStatus.deleted,
      });

      expect(() => user.activate()).toThrow(DomainError);
      expect(() => user.suspend()).toThrow(DomainError);
      expect(() => user.disable()).toThrow(DomainError);
    });

    it('rejects disabled -> suspended (not in the allowed map)', () => {
      const user = User.fromPersistence({
        id,
        email,
        password,
        status: UserStatus.disabled,
      });

      expect(() => user.suspend()).toThrow(DomainError);
      expect(user.getStatus()).toBe(UserStatus.disabled);
    });
  });
});

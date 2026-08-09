import { DomainError } from 'src/shared/domain/domain-error';
import { UserRepository } from '../../domain/ports/user.repository';
import { Email } from '../../domain/user/email.vo';
import { HashedPassword } from '../../domain/user/hashed-password.vo';
import { User } from '../../domain/user/user';
import { UserStatus } from '../../domain/user/user-status.enum';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenIssuer } from '../ports/token-issuer';
import { AuthenticateUser } from './authenticate-user';

describe('AuthenticateUser', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenIssuer: jest.Mocked<TokenIssuer>;
  let useCase: AuthenticateUser;

  const id = UserIdentifier.generate();
  const email = Email.fromString('user@example.com');
  const hashedPassword = HashedPassword.fromString('$2b$10$fakehash');

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    tokenIssuer = {
      issue: jest.fn(),
    };
    useCase = new AuthenticateUser(userRepository, passwordHasher, tokenIssuer);
  });

  it('returns a token for valid credentials of an active user', async () => {
    userRepository.findByEmail.mockResolvedValue(
      User.register(id, email, hashedPassword),
    );
    passwordHasher.compare.mockResolvedValue(true);
    tokenIssuer.issue.mockResolvedValue('signed.jwt.token');

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'abcd1234',
    });

    expect(result).toEqual({ token: 'signed.jwt.token' });
    expect(tokenIssuer.issue).toHaveBeenCalledWith(id);
  });

  it('rejects an invalid email before touching the repository', async () => {
    await expect(
      useCase.execute({ email: 'not-an-email', password: 'abcd1234' }),
    ).rejects.toThrow(DomainError);

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('rejects with a generic message when no account matches the email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'abcd1234' }),
    ).rejects.toThrow('Invalid credentials');

    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('rejects with the same generic message when the password does not match', async () => {
    userRepository.findByEmail.mockResolvedValue(
      User.register(id, email, hashedPassword),
    );
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'abcd1234' }),
    ).rejects.toThrow('Invalid credentials');

    expect(tokenIssuer.issue).not.toHaveBeenCalled();
  });

  it('rejects a non-active account only after the password is proven correct', async () => {
    const suspendedUser = User.fromPersistence({
      id,
      email,
      password: hashedPassword,
      status: UserStatus.suspended,
    });
    userRepository.findByEmail.mockResolvedValue(suspendedUser);
    passwordHasher.compare.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'user@example.com', password: 'abcd1234' }),
    ).rejects.toThrow('Account is not active');

    expect(tokenIssuer.issue).not.toHaveBeenCalled();
  });
});

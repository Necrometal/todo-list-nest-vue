import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const user: User = {
    id: 'user-1',
    email: 'jane@example.com',
    password: 'hashed-password',
    name: 'Jane',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmailWithPassword: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
    } as unknown as jest.Mocked<JwtService>;

    authService = new AuthService(usersService, jwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password, creates the user and returns a token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue(user);

      const result = await authService.register({
        email: user.email,
        password: 'plain-password',
        name: user.name,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        user.email,
        'hashed-password',
        user.name,
      );
      expect(result).toEqual({
        accessToken: 'signed-jwt',
        user: { id: user.id, email: user.email, name: user.name },
      });
    });
  });

  describe('login', () => {
    it('returns a token when credentials are valid', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: user.email,
        password: 'plain-password',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        user.password,
      );
      expect(result.accessToken).toBe('signed-jwt');
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: user.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

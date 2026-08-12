import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;

  const user: User = {
    id: 'user-1',
    email: 'jane@example.com',
    password: 'hashed-password',
    name: 'Jane',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    usersService = new UsersService(usersRepository);
  });

  describe('create', () => {
    it('creates and saves a new user', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockResolvedValue(user);

      const result = await usersService.create(
        user.email,
        user.password,
        user.name,
      );

      expect(usersRepository.create).toHaveBeenCalledWith({
        email: user.email,
        password: user.password,
        name: user.name,
      });
      expect(result).toEqual(user);
    });

    it('throws ConflictException when the email is already used', async () => {
      usersRepository.findOneBy.mockResolvedValue(user);

      await expect(
        usersService.create(user.email, user.password, user.name),
      ).rejects.toThrow(ConflictException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('selects the password explicitly via query builder', async () => {
      const getOne = jest.fn().mockResolvedValue(user);
      const where = jest.fn().mockReturnValue({ getOne });
      const addSelect = jest.fn().mockReturnValue({ where });
      usersRepository.createQueryBuilder.mockReturnValue({
        addSelect,
      } as never);

      const result = await usersService.findByEmailWithPassword(user.email);

      expect(addSelect).toHaveBeenCalledWith('user.password');
      expect(where).toHaveBeenCalledWith('user.email = :email', {
        email: user.email,
      });
      expect(result).toEqual(user);
    });
  });

  describe('getProfile', () => {
    it('returns the user when found', async () => {
      usersRepository.findOneBy.mockResolvedValue(user);

      const result = await usersService.getProfile(user.id);

      expect(result).toEqual(user);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(usersService.getProfile('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('merges the dto into the existing user and saves it', async () => {
      usersRepository.findOneBy.mockResolvedValue(user);
      usersRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity as User),
      );

      const result = await usersService.updateProfile(user.id, {
        name: 'Jane Doe',
      });

      expect(result.name).toBe('Jane Doe');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(
        usersService.updateProfile('missing-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the user by id', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await usersService.remove(user.id);

      expect(usersRepository.delete).toHaveBeenCalledWith(user.id);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(usersService.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

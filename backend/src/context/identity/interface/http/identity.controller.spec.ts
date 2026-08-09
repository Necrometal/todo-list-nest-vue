import { AuthenticateUser } from '../../application/use-cases/authenticate-user';
import { RegisterUser } from '../../application/use-cases/register-user';
import { IdentityController } from './identity.controller';

describe('IdentityController', () => {
  let registerUser: jest.Mocked<RegisterUser>;
  let authenticateUser: jest.Mocked<AuthenticateUser>;
  let controller: IdentityController;

  beforeEach(() => {
    registerUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUser>;
    authenticateUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AuthenticateUser>;
    controller = new IdentityController(registerUser, authenticateUser);
  });

  describe('register', () => {
    it('forwards the dto to RegisterUser and returns its result as-is', async () => {
      const dto = { email: 'user@example.com', password: 'abcd1234' };
      const output = { userId: 'some-id' };
      registerUser.execute.mockResolvedValue(output);

      const result = await controller.register(dto);

      expect(registerUser.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(output);
    });
  });

  describe('authenticate', () => {
    it('forwards the dto to AuthenticateUser and returns its result as-is', async () => {
      const dto = { email: 'user@example.com', password: 'abcd1234' };
      const output = { token: 'signed.jwt.token' };
      authenticateUser.execute.mockResolvedValue(output);

      const result = await controller.authenticate(dto);

      expect(authenticateUser.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(output);
    });
  });
});

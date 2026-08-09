import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticateUserDto } from './authenticate-user.dto';

describe('AuthenticateUserDto', () => {
  it('passes validation for a well-formed body', async () => {
    const dto = plainToInstance(AuthenticateUserDto, {
      email: 'user@example.com',
      password: 'anything',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails when email is not a valid email', async () => {
    const dto = plainToInstance(AuthenticateUserDto, {
      email: 'not-an-email',
      password: 'anything',
    });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toContain('email');
  });

  it('fails when password is missing (no length rule here, unlike register)', async () => {
    const dto = plainToInstance(AuthenticateUserDto, {
      email: 'user@example.com',
    });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toContain('password');
  });
});

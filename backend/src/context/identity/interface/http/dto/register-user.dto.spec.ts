import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

describe('RegisterUserDto', () => {
  it('passes validation for a well-formed body', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      email: 'user@example.com',
      password: 'abcd1234',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails when email is not a valid email', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      email: 'not-an-email',
      password: 'abcd1234',
    });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toContain('email');
  });

  it('fails when password is shorter than 8 characters', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      email: 'user@example.com',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toContain('password');
  });

  it('fails when a required field is missing', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      email: 'user@example.com',
    });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toContain('password');
  });
});

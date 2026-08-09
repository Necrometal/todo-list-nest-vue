import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user';
import { RegisterUser } from '../../application/use-cases/register-user';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

// Deliberately thin: parse input, call use-case, shape output. No business
// logic here — that's the whole point of pushing it into RegisterUser /
// AuthenticateUser, this controller is a swappable HTTP adapter around them.
@Controller('identity')
export class IdentityController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticateUser: AuthenticateUser,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() dto: AuthenticateUserDto) {
    return this.authenticateUser.execute(dto);
  }
}

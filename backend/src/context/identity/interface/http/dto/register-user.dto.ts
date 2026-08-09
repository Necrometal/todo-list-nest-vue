import { IsEmail, IsString, MinLength } from 'class-validator';

// Checks transport shape only (field present, right primitive type). Domain
// rules (email regex, password policy) stay in Email/PlainPassword — this
// class never duplicates them, it just guards the use-case from a malformed
// HTTP body reaching it.
export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

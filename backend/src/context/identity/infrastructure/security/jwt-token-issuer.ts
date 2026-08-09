import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { TokenIssuer } from '../../application/ports/token-issuer';

@Injectable()
export class JwtTokenIssuer extends TokenIssuer {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async issue(userId: UserIdentifier): Promise<string> {
    // `sub` (subject): standard JWT claim name for "who this token is
    // about" — keeps the payload readable by any generic JWT tooling, not
    // just this codebase.
    return this.jwtService.signAsync({ sub: userId.toString() });
  }
}

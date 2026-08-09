import { JwtService } from '@nestjs/jwt';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { JwtTokenIssuer } from './jwt-token-issuer';

describe('JwtTokenIssuer', () => {
  it('signs a token with the user id as the standard "sub" claim', async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    } as unknown as jest.Mocked<JwtService>;
    const issuer = new JwtTokenIssuer(jwtService);
    const userId = UserIdentifier.generate();

    const token = await issuer.issue(userId);

    expect(token).toBe('signed.jwt.token');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: userId.toString(),
    });
  });
});

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DomainEventPublisher } from 'src/shared/application/ports/domain-event-publisher';
import { EnvironmentVariables } from 'src/shared/infrastructure/config/environment-variables';
import { EventEmitter2DomainEventPublisher } from 'src/shared/infrastructure/events/event-emitter2-domain-event-publisher';
import { PasswordHasher } from './application/ports/password-hasher';
import { TokenIssuer } from './application/ports/token-issuer';
import { AuthenticateUser } from './application/use-cases/authenticate-user';
import { RegisterUser } from './application/use-cases/register-user';
import { UserRepository } from './domain/ports/user.repository';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtTokenIssuer } from './infrastructure/security/jwt-token-issuer';
import { IdentityController } from './interface/http/identity.controller';

@Module({
  imports: [
    // registerAsync + ConfigService instead of static `register`: JWT_SECRET
    // is now required and validated at boot (see EnvironmentVariables), so
    // no dev-secret fallback is needed here — the app never starts without it.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn:
            configService.get('EXPIRATION_TIMER', { infer: true }) ?? '1h',
        },
      }),
    }),
  ],
  controllers: [IdentityController],
  providers: [
    RegisterUser,
    AuthenticateUser,
    { provide: UserRepository, useClass: InMemoryUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenIssuer, useClass: JwtTokenIssuer },
    {
      provide: DomainEventPublisher,
      useClass: EventEmitter2DomainEventPublisher,
    },
  ],
})
export class IdentityModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { IdentityModule } from 'src/context/identity/identity.module';
import { NotificationsModule } from 'src/context/notifications/notifications.module';
import { validateEnvironmentVariables } from '../config/validate-environment-variables';
import { DomainErrorFilter } from '../filters/domain-error.filter';

@Module({
  imports: [
    // isGlobal: ConfigService is injectable anywhere without re-importing
    // this module. validate: runs at boot, throws (crashes startup) on a
    // missing/malformed var instead of failing later mid-request.
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
    }),
    // .forRoot() registers EventEmitter2 as a global provider: any context
    // module can inject it, or use `@OnEvent()`, without importing this module
    // itself — that's what lets a context listen to events published by any
    // other context without a direct dependency between them.
    EventEmitterModule.forRoot(),
    IdentityModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from 'src/context/identity/identity.module';
import { NotificationsModule } from 'src/context/notifications/notifications.module';
import { EnvironmentVariables } from '../config/environment-variables';
import { typeOrmOptionsFactory } from '../config/typeorm-options.factory';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) =>
        typeOrmOptionsFactory(configService),
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

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EnvironmentVariables } from './shared/infrastructure/config/environment-variables';
import { AppModule } from './shared/infrastructure/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // whitelist: strips unknown fields; forbidNonWhitelisted: rejects them
  // instead of silently dropping, so bad clients get a 400 they can act on.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  await app.listen(configService.get('PORT', { infer: true }) ?? 3000);
}
void bootstrap();

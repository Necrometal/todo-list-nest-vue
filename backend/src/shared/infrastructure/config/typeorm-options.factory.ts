import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentVariables } from './environment-variables';

// synchronize: true is fine for this local/learning project (no migrations
// yet) but is unsafe for a real deployment — it can silently drop/alter
// columns to match entities. Revisit with proper migrations before prod.
export function typeOrmOptionsFactory(
  configService: ConfigService<EnvironmentVariables, true>,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get('DATABASE_HOST', { infer: true }),
    port: configService.get('DATABASE_PORT', { infer: true }),
    username: configService.get('DATABASE_USER', { infer: true }),
    password: configService.get('DATABASE_PASSWORD', { infer: true }),
    database: configService.get('DATABASE_NAME', { infer: true }),
    autoLoadEntities: true,
    synchronize: true,
  };
}

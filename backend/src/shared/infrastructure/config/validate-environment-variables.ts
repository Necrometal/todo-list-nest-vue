import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment-variables';

// Passed to ConfigModule.forRoot({ validate }): runs once at boot, so a
// missing/malformed var (e.g. no JWT_SECRET) crashes startup with a clear
// message instead of surfacing later as a cryptic failure mid-request.
export function validateEnvironmentVariables(
  config: Record<string, unknown>,
): EnvironmentVariables {
  // No `enableImplicitConversion`: PORT/EXPIRATION_TIMER already coerce via
  // explicit `@Transform` on EnvironmentVariables — implicit conversion would
  // additionally need TS design-type reflection, which needs the
  // `reflect-metadata` polyfill loaded globally (true only incidentally,
  // wherever `@nestjs/core` has already been imported).
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

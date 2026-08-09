import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

// Same class-validator idiom as the request DTOs (RegisterUserDto, ...):
// one typed, validated shape instead of scattered `process.env.X` reads.
export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  JWT_SECRET!: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  // Seconds until a JWT expires. Optional: JwtModule falls back to '1h' at
  // the call site when unset.
  @IsOptional()
  @Transform(({ value }: { value: string }) => Number(value))
  @IsInt()
  EXPIRATION_TIMER?: number;
}

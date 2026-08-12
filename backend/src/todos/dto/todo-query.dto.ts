import { IsOptional, IsUUID } from 'class-validator';

export class TodoQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

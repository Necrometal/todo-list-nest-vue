import { IsIn, IsOptional } from 'class-validator';
import type { StatsGroupBy } from '../../todo-history/todo-history.service';

export class TodoStatsQueryDto {
  @IsOptional()
  @IsIn(['day', 'month', 'year'])
  groupBy: StatsGroupBy = 'day';
}

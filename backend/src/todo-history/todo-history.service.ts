import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoHistory, TodoAction } from './entities/todo-history.entity';

export type StatsGroupBy = 'day' | 'month' | 'year';

export interface TodoStatsBucket {
  period: string;
  created: number;
  completed: number;
}

const DATE_FORMATS: Record<StatsGroupBy, string> = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

@Injectable()
export class TodoHistoryService {
  constructor(
    @InjectRepository(TodoHistory)
    private readonly historyRepository: Repository<TodoHistory>,
  ) {}

  record(
    todoId: string,
    todoTitle: string,
    userId: string,
    action: TodoAction,
    changes: Record<string, unknown> | null = null,
  ): Promise<TodoHistory> {
    const entry = this.historyRepository.create({
      todoId,
      todoTitle,
      userId,
      action,
      changes,
    });
    return this.historyRepository.save(entry);
  }

  findByTodoId(todoId: string): Promise<TodoHistory[]> {
    return this.historyRepository.find({
      where: { todoId },
      order: { createdAt: 'DESC' },
    });
  }

  findAllForUser(userId: string): Promise<TodoHistory[]> {
    return this.historyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(
    userId: string,
    groupBy: StatsGroupBy,
  ): Promise<TodoStatsBucket[]> {
    const format = DATE_FORMATS[groupBy];
    const rows = await this.historyRepository.query<
      { period: string; created: string; completed: string }[]
    >(
      `SELECT
         DATE_FORMAT(createdAt, ?) AS period,
         SUM(CASE WHEN action = 'created' THEN 1 ELSE 0 END) AS created,
         SUM(CASE WHEN action = 'updated' AND JSON_UNQUOTE(JSON_EXTRACT(changes, '$.completed.to')) = 'true' THEN 1 ELSE 0 END) AS completed
       FROM todo_history
       WHERE userId = ?
       GROUP BY period
       ORDER BY period ASC`,
      [format, userId],
    );

    return rows.map((row) => ({
      period: row.period,
      created: Number(row.created),
      completed: Number(row.completed),
    }));
  }
}

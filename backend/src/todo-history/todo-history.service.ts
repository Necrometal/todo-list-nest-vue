import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoHistory, TodoAction } from './entities/todo-history.entity';

@Injectable()
export class TodoHistoryService {
  constructor(
    @InjectRepository(TodoHistory)
    private readonly historyRepository: Repository<TodoHistory>,
  ) {}

  record(
    todoId: string,
    userId: string,
    action: TodoAction,
    changes: Record<string, unknown> | null = null,
  ): Promise<TodoHistory> {
    const entry = this.historyRepository.create({
      todoId,
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
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  TodoHistoryService,
  StatsGroupBy,
} from '../todo-history/todo-history.service';
import { TodoAction } from '../todo-history/entities/todo-history.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
    private readonly todoHistoryService: TodoHistoryService,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAllForUser(ownerId: string, categoryId?: string): Promise<Todo[]> {
    return this.todosRepository.find({
      where: categoryId ? { ownerId, categoryId } : { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, ownerId: string): Promise<Todo> {
    const todo = await this.todosRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.ownerId !== ownerId) {
      throw new ForbiddenException('Not your todo');
    }
    return todo;
  }

  async create(ownerId: string, dto: CreateTodoDto): Promise<Todo> {
    if (dto.categoryId) {
      await this.categoriesService.findOneForUser(dto.categoryId, ownerId);
    }

    const todo = this.todosRepository.create({ ...dto, ownerId });
    const saved = await this.todosRepository.save(todo);
    await this.todoHistoryService.record(
      saved.id,
      saved.title,
      ownerId,
      TodoAction.CREATED,
      {
        title: saved.title,
        description: saved.description,
      },
    );
    return saved;
  }

  async update(id: string, ownerId: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOneForUser(id, ownerId);

    if (dto.categoryId) {
      await this.categoriesService.findOneForUser(dto.categoryId, ownerId);
    }

    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    ) as Partial<Todo>;

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, value] of Object.entries(patch) as [
      keyof Todo,
      unknown,
    ][]) {
      if (value !== todo[key]) {
        changes[key] = { from: todo[key], to: value };
      }
    }

    Object.assign(todo, patch);
    await this.todosRepository.save(todo);

    if (Object.keys(changes).length > 0) {
      await this.todoHistoryService.record(
        todo.id,
        todo.title,
        ownerId,
        TodoAction.UPDATED,
        changes,
      );
    }

    return todo;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const todo = await this.findOneForUser(id, ownerId);
    await this.todosRepository.remove(todo);
    await this.todoHistoryService.record(
      id,
      todo.title,
      ownerId,
      TodoAction.DELETED,
    );
  }

  getHistory(id: string, ownerId: string) {
    return this.findOneForUser(id, ownerId).then(() =>
      this.todoHistoryService.findByTodoId(id),
    );
  }

  getAllHistory(ownerId: string) {
    return this.todoHistoryService.findAllForUser(ownerId);
  }

  getStats(ownerId: string, groupBy: StatsGroupBy) {
    return this.todoHistoryService.getStats(ownerId, groupBy);
  }
}

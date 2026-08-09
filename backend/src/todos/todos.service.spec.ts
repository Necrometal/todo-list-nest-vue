import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TodosService } from './todos.service';
import { Todo } from './entities/todo.entity';
import { TodoHistoryService } from '../todo-history/todo-history.service';
import { TodoAction } from '../todo-history/entities/todo-history.entity';

describe('TodosService', () => {
  let todosService: TodosService;
  let todosRepository: jest.Mocked<Repository<Todo>>;
  let todoHistoryService: jest.Mocked<TodoHistoryService>;

  const ownerId = 'owner-1';
  const todo: Todo = {
    id: 'todo-1',
    title: 'Buy milk',
    description: null,
    completed: false,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    todosRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Todo>>;

    todoHistoryService = {
      record: jest.fn(),
      findByTodoId: jest.fn(),
    } as unknown as jest.Mocked<TodoHistoryService>;

    todosService = new TodosService(todosRepository, todoHistoryService);
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException when the todo does not exist', async () => {
      todosRepository.findOneBy.mockResolvedValue(null);

      await expect(
        todosService.findOneForUser('missing', ownerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the todo belongs to someone else', async () => {
      todosRepository.findOneBy.mockResolvedValue({
        ...todo,
        ownerId: 'someone-else',
      });

      await expect(
        todosService.findOneForUser(todo.id, ownerId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('saves the todo and records a CREATED history entry', async () => {
      todosRepository.create.mockReturnValue(todo);
      todosRepository.save.mockResolvedValue(todo);

      const result = await todosService.create(ownerId, { title: todo.title });

      expect(todosRepository.create).toHaveBeenCalledWith({
        title: todo.title,
        ownerId,
      });
      expect(todoHistoryService.record).toHaveBeenCalledWith(
        todo.id,
        todo.title,
        ownerId,
        TodoAction.CREATED,
        { title: todo.title, description: todo.description },
      );
      expect(result).toEqual(todo);
    });
  });

  describe('update', () => {
    it('only applies fields present in the dto and records the diff', async () => {
      todosRepository.findOneBy.mockResolvedValue({ ...todo });
      todosRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity as Todo),
      );

      const result = await todosService.update(todo.id, ownerId, {
        completed: true,
      });

      expect(result.title).toBe(todo.title);
      expect(result.completed).toBe(true);
      expect(todoHistoryService.record).toHaveBeenCalledWith(
        todo.id,
        todo.title,
        ownerId,
        TodoAction.UPDATED,
        { completed: { from: false, to: true } },
      );
    });

    it('does not record history when nothing actually changed', async () => {
      todosRepository.findOneBy.mockResolvedValue({ ...todo });
      todosRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity as Todo),
      );

      await todosService.update(todo.id, ownerId, { title: todo.title });

      expect(todoHistoryService.record).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the todo and records a DELETED history entry', async () => {
      todosRepository.findOneBy.mockResolvedValue({ ...todo });
      todosRepository.remove.mockResolvedValue(todo);

      await todosService.remove(todo.id, ownerId);

      expect(todosRepository.remove).toHaveBeenCalledWith(todo);
      expect(todoHistoryService.record).toHaveBeenCalledWith(
        todo.id,
        todo.title,
        ownerId,
        TodoAction.DELETED,
      );
    });
  });
});

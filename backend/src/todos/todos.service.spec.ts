import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TodosService } from './todos.service';
import { Todo } from './entities/todo.entity';
import { TodoHistoryService } from '../todo-history/todo-history.service';
import { TodoAction } from '../todo-history/entities/todo-history.entity';
import { CategoriesService } from '../categories/categories.service';

describe('TodosService', () => {
  let todosService: TodosService;
  let todosRepository: jest.Mocked<Repository<Todo>>;
  let todoHistoryService: jest.Mocked<TodoHistoryService>;
  let categoriesService: jest.Mocked<CategoriesService>;

  const ownerId = 'owner-1';
  const todo: Todo = {
    id: 'todo-1',
    title: 'Buy milk',
    description: null,
    completed: false,
    ownerId,
    categoryId: null,
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

    categoriesService = {
      findOneForUser: jest.fn(),
    } as unknown as jest.Mocked<CategoriesService>;

    todosService = new TodosService(
      todosRepository,
      todoHistoryService,
      categoriesService,
    );
  });

  describe('findAllForUser', () => {
    it('filters by categoryId when provided', async () => {
      todosRepository.find.mockResolvedValue([todo]);

      await todosService.findAllForUser(ownerId, 'category-1');

      expect(todosRepository.find).toHaveBeenCalledWith({
        where: { ownerId, categoryId: 'category-1' },
        order: { createdAt: 'DESC' },
      });
    });
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

    it('rejects a categoryId that does not belong to the owner', async () => {
      categoriesService.findOneForUser.mockRejectedValue(
        new ForbiddenException('Not your category'),
      );

      await expect(
        todosService.create(ownerId, {
          title: todo.title,
          categoryId: 'foreign-category',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(categoriesService.findOneForUser).toHaveBeenCalledWith(
        'foreign-category',
        ownerId,
      );
      expect(todosRepository.create).not.toHaveBeenCalled();
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

    it('rejects a categoryId that does not belong to the owner', async () => {
      todosRepository.findOneBy.mockResolvedValue({ ...todo });
      categoriesService.findOneForUser.mockRejectedValue(
        new ForbiddenException('Not your category'),
      );

      await expect(
        todosService.update(todo.id, ownerId, {
          categoryId: 'foreign-category',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(categoriesService.findOneForUser).toHaveBeenCalledWith(
        'foreign-category',
        ownerId,
      );
      expect(todosRepository.save).not.toHaveBeenCalled();
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

import { Repository } from 'typeorm';
import { TodoHistoryService } from './todo-history.service';
import { TodoHistory, TodoAction } from './entities/todo-history.entity';

describe('TodoHistoryService', () => {
  let service: TodoHistoryService;
  let repository: jest.Mocked<Repository<TodoHistory>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<Repository<TodoHistory>>;

    service = new TodoHistoryService(repository);
  });

  describe('record', () => {
    it('creates and saves a history entry with the todo title snapshot', async () => {
      const entry = {
        id: 'h-1',
        todoId: 't-1',
        todoTitle: 'Buy milk',
        userId: 'u-1',
        action: TodoAction.CREATED,
        changes: null,
        createdAt: new Date(),
      };
      repository.create.mockReturnValue(entry);
      repository.save.mockResolvedValue(entry);

      await service.record('t-1', 'Buy milk', 'u-1', TodoAction.CREATED, null);

      expect(repository.create).toHaveBeenCalledWith({
        todoId: 't-1',
        todoTitle: 'Buy milk',
        userId: 'u-1',
        action: TodoAction.CREATED,
        changes: null,
      });
    });
  });

  describe('findAllForUser', () => {
    it('scopes to the given user, newest first', async () => {
      await service.findAllForUser('u-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getStats', () => {
    it('runs a grouped aggregate query scoped to the user and maps counts to numbers', async () => {
      repository.query.mockResolvedValue([
        { period: '2026-08-09', created: '2', completed: '1' },
      ]);

      const result = await service.getStats('u-1', 'day');

      expect(repository.query).toHaveBeenCalledWith(expect.any(String), [
        '%Y-%m-%d',
        'u-1',
      ]);
      expect(result).toEqual([
        { period: '2026-08-09', created: 2, completed: 1 },
      ]);
    });

    it('uses the month/year date formats for those groupings', async () => {
      repository.query.mockResolvedValue([]);

      await service.getStats('u-1', 'month');
      expect(repository.query).toHaveBeenCalledWith(expect.any(String), [
        '%Y-%m',
        'u-1',
      ]);

      await service.getStats('u-1', 'year');
      expect(repository.query).toHaveBeenCalledWith(expect.any(String), [
        '%Y',
        'u-1',
      ]);
    });
  });
});

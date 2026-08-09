import { Notification } from '../../domain/notification/notification';
import { NotificationIdentifier } from '../../domain/notification/notification.identifier';
import { InMemoryNotificationRepository } from './in-memory-notification.repository';

describe('InMemoryNotificationRepository', () => {
  it('returns an empty list when nothing has been saved', async () => {
    const repository = new InMemoryNotificationRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  it('returns every saved notification', async () => {
    const repository = new InMemoryNotificationRepository();
    const first = Notification.record(
      NotificationIdentifier.generate(),
      'first@example.com',
      'Welcome email',
    );
    const second = Notification.record(
      NotificationIdentifier.generate(),
      'second@example.com',
      'Welcome email',
    );

    await repository.save(first);
    await repository.save(second);

    expect(await repository.findAll()).toEqual([first, second]);
  });
});

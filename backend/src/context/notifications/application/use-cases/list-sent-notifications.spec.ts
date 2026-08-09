import { Notification } from '../../domain/notification/notification';
import { NotificationIdentifier } from '../../domain/notification/notification.identifier';
import { NotificationRepository } from '../../domain/ports/notification.repository';
import { ListSentNotifications } from './list-sent-notifications';

describe('ListSentNotifications', () => {
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let useCase: ListSentNotifications;

  beforeEach(() => {
    notificationRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };
    useCase = new ListSentNotifications(notificationRepository);
  });

  it('returns an empty list when nothing was recorded', async () => {
    notificationRepository.findAll.mockResolvedValue([]);

    expect(await useCase.execute()).toEqual([]);
  });

  it('maps every recorded notification to a plain view', async () => {
    const id = NotificationIdentifier.generate();
    const notification = Notification.record(
      id,
      'user@example.com',
      'Welcome email',
    );
    notificationRepository.findAll.mockResolvedValue([notification]);

    const result = await useCase.execute();

    expect(result).toEqual([
      {
        notificationId: id.toString(),
        recipientEmail: 'user@example.com',
        message: 'Welcome email',
        sentAt: notification.getSentAt(),
      },
    ]);
  });
});

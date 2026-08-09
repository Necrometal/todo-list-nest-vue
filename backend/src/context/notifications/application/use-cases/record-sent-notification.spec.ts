import { NotificationRepository } from '../../domain/ports/notification.repository';
import { RecordSentNotification } from './record-sent-notification';

describe('RecordSentNotification', () => {
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let useCase: RecordSentNotification;

  beforeEach(() => {
    notificationRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };
    useCase = new RecordSentNotification(notificationRepository);
  });

  it('saves a notification and returns its id', async () => {
    const result = await useCase.execute({
      recipientEmail: 'user@example.com',
      message: 'Welcome email',
    });

    expect(result.notificationId).toEqual(expect.any(String));
    expect(notificationRepository.save).toHaveBeenCalledTimes(1);
    const saved = notificationRepository.save.mock.calls[0][0];
    expect(saved.getRecipientEmail()).toBe('user@example.com');
    expect(saved.getMessage()).toBe('Welcome email');
    expect(saved.getIdentifier().toString()).toBe(result.notificationId);
  });
});

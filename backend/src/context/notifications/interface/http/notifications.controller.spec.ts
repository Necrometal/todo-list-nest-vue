import { ListSentNotifications } from '../../application/use-cases/list-sent-notifications';
import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  it('forwards the result of ListSentNotifications as-is', async () => {
    const listSentNotifications = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListSentNotifications>;
    const output = [
      {
        notificationId: 'some-id',
        recipientEmail: 'user@example.com',
        message: 'Welcome email',
        sentAt: new Date(),
      },
    ];
    listSentNotifications.execute.mockResolvedValue(output);
    const controller = new NotificationsController(listSentNotifications);

    const result = await controller.list();

    expect(listSentNotifications.execute).toHaveBeenCalledWith();
    expect(result).toBe(output);
  });
});

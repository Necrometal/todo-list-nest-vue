import { Notification } from './notification';
import { NotificationIdentifier } from './notification.identifier';

describe('Notification', () => {
  it('records a new notification with the given recipient and message', () => {
    const id = NotificationIdentifier.generate();

    const notification = Notification.record(
      id,
      'user@example.com',
      'Welcome email',
    );

    expect(notification.getIdentifier()).toBe(id);
    expect(notification.getRecipientEmail()).toBe('user@example.com');
    expect(notification.getMessage()).toBe('Welcome email');
    expect(notification.getSentAt()).toBeInstanceOf(Date);
  });

  it('rehydrates from persistence without changing the given properties', () => {
    const id = NotificationIdentifier.generate();
    const sentAt = new Date('2026-01-01T00:00:00.000Z');

    const notification = Notification.fromPersistence({
      id,
      recipientEmail: 'user@example.com',
      message: 'Welcome email',
      sentAt,
    });

    expect(notification.getSentAt()).toBe(sentAt);
  });
});

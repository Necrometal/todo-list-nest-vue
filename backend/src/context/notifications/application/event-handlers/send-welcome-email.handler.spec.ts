import { Logger } from '@nestjs/common';
import { UserRegisteredEvent } from 'src/context/identity/domain/events/user-registered.event';
import { Email } from 'src/context/identity/domain/user/email.vo';
import { UserIdentifier } from 'src/context/identity/domain/user/user.identifier';
import { RecordSentNotification } from '../use-cases/record-sent-notification';
import { SendWelcomeEmailHandler } from './send-welcome-email.handler';

describe('SendWelcomeEmailHandler', () => {
  it('logs the recipient email and records the notification when a user registers', async () => {
    const recordSentNotification = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RecordSentNotification>;
    const handler = new SendWelcomeEmailHandler(recordSentNotification);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const event = new UserRegisteredEvent(
      UserIdentifier.generate(),
      new Date(),
      Email.fromString('user@example.com'),
    );

    await handler.handle(event);

    expect(logSpy).toHaveBeenCalledWith(
      'Would send welcome email to user@example.com',
    );
    expect(recordSentNotification.execute).toHaveBeenCalledWith({
      recipientEmail: 'user@example.com',
      message: 'Welcome email',
    });

    logSpy.mockRestore();
  });
});

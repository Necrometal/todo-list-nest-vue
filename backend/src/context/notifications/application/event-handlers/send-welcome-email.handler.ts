import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from 'src/context/identity/domain/events/user-registered.event';
import { RecordSentNotification } from '../use-cases/record-sent-notification';

// Proves a context other than identity can react to identity's events with
// zero coupling beyond the event class itself (no shared publisher instance,
// no module import of IdentityModule). `.toString()` on the VO here is the
// one place this context reaches into identity's domain type — everything
// past this line (RecordSentNotification, Notification) stays on plain
// primitives, this context's own domain. Log line stands in for a real mail
// adapter call, which doesn't exist yet.
@Injectable()
export class SendWelcomeEmailHandler {
  private readonly logger = new Logger(SendWelcomeEmailHandler.name);

  constructor(
    private readonly recordSentNotification: RecordSentNotification,
  ) {}

  @OnEvent('UserRegisteredEvent')
  async handle(event: UserRegisteredEvent): Promise<void> {
    const recipientEmail = event.email.toString();
    this.logger.log(`Would send welcome email to ${recipientEmail}`);
    await this.recordSentNotification.execute({
      recipientEmail,
      message: 'Welcome email',
    });
  }
}

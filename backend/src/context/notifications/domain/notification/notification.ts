import { AggregateRoot } from 'src/shared/domain/aggregate-root';
import { NotificationIdentifier } from './notification.identifier';

interface Properties {
  id: NotificationIdentifier;
  recipientEmail: string;
  message: string;
  sentAt: Date;
}

// `recipientEmail` is a plain string, not identity's `Email` VO: this
// context's own domain stays free of another context's domain types. The
// event handler crosses that boundary once, at the edge, by calling
// `.toString()` before reaching into here.
export class Notification extends AggregateRoot<Properties> {
  static record(
    id: NotificationIdentifier,
    recipientEmail: string,
    message: string,
  ): Notification {
    return new Notification({
      id,
      recipientEmail,
      message,
      sentAt: new Date(),
    });
  }

  static fromPersistence(props: Properties): Notification {
    return new Notification(props);
  }

  getRecipientEmail(): string {
    return this.props.recipientEmail;
  }

  getMessage(): string {
    return this.props.message;
  }

  getSentAt(): Date {
    return this.props.sentAt;
  }
}

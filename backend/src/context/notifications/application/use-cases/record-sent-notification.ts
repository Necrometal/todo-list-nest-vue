import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/notification/notification';
import { NotificationIdentifier } from '../../domain/notification/notification.identifier';
import { NotificationRepository } from '../../domain/ports/notification.repository';

export interface RecordSentNotificationInput {
  recipientEmail: string;
  message: string;
}

export interface RecordSentNotificationOutput {
  notificationId: string;
}

@Injectable()
export class RecordSentNotification {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    input: RecordSentNotificationInput,
  ): Promise<RecordSentNotificationOutput> {
    const id = NotificationIdentifier.generate();
    const notification = Notification.record(
      id,
      input.recipientEmail,
      input.message,
    );

    await this.notificationRepository.save(notification);

    return { notificationId: id.toString() };
  }
}

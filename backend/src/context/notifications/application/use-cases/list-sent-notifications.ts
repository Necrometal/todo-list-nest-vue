import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../domain/ports/notification.repository';

export interface SentNotificationView {
  notificationId: string;
  recipientEmail: string;
  message: string;
  sentAt: Date;
}

@Injectable()
export class ListSentNotifications {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(): Promise<SentNotificationView[]> {
    const notifications = await this.notificationRepository.findAll();

    return notifications.map((notification) => ({
      notificationId: notification.getIdentifier().toString(),
      recipientEmail: notification.getRecipientEmail(),
      message: notification.getMessage(),
      sentAt: notification.getSentAt(),
    }));
  }
}

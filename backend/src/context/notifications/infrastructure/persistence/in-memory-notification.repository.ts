/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../domain/ports/notification.repository';
import { Notification } from '../../domain/notification/notification';

@Injectable()
export class InMemoryNotificationRepository extends NotificationRepository {
  private readonly notifications = new Map<string, Notification>();

  async findAll(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async save(notification: Notification): Promise<void> {
    this.notifications.set(
      notification.getIdentifier().toString(),
      notification,
    );
  }
}

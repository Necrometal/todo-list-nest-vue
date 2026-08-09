import { Notification } from '../notification/notification';

export abstract class NotificationRepository {
  abstract findAll(): Promise<Notification[]>;
  abstract save(notification: Notification): Promise<void>;
}

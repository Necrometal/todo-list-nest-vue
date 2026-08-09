import { Module } from '@nestjs/common';
import { SendWelcomeEmailHandler } from './application/event-handlers/send-welcome-email.handler';
import { ListSentNotifications } from './application/use-cases/list-sent-notifications';
import { RecordSentNotification } from './application/use-cases/record-sent-notification';
import { NotificationRepository } from './domain/ports/notification.repository';
import { InMemoryNotificationRepository } from './infrastructure/persistence/in-memory-notification.repository';
import { NotificationsController } from './interface/http/notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [
    SendWelcomeEmailHandler,
    RecordSentNotification,
    ListSentNotifications,
    {
      provide: NotificationRepository,
      useClass: InMemoryNotificationRepository,
    },
  ],
})
export class NotificationsModule {}

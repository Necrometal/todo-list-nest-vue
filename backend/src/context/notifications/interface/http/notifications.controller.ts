import { Controller, Get } from '@nestjs/common';
import { ListSentNotifications } from '../../application/use-cases/list-sent-notifications';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly listSentNotifications: ListSentNotifications) {}

  @Get()
  async list() {
    return this.listSentNotifications.execute();
  }
}

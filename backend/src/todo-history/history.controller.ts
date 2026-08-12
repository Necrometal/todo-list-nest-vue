import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { TodoHistoryService } from './todo-history.service';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly todoHistoryService: TodoHistoryService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.todoHistoryService.findAllForUser(user.id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoHistory } from './entities/todo-history.entity';
import { TodoHistoryService } from './todo-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([TodoHistory])],
  providers: [TodoHistoryService],
  exports: [TodoHistoryService],
})
export class TodoHistoryModule {}

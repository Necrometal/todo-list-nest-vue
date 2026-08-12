import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoHistory } from './entities/todo-history.entity';
import { TodoHistoryService } from './todo-history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TodoHistory])],
  controllers: [HistoryController],
  providers: [TodoHistoryService],
  exports: [TodoHistoryService],
})
export class TodoHistoryModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodoHistoryModule } from '../todo-history/todo-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), TodoHistoryModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}

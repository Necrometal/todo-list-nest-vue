import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TodoAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity('todo_history')
export class TodoHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  todoId: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TodoAction })
  action: TodoAction;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}

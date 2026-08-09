import { Column, Entity, PrimaryColumn } from 'typeorm';

// Plain TypeORM entity, isolated from the domain `User` aggregate: the
// mapping to/from `User` happens in TypeOrmUserRepository, so `typeorm`
// decorators never leak into `domain/`.
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'tinyint' })
  status!: number;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/ports/user.repository';
import { Email } from '../../domain/user/email.vo';
import { HashedPassword } from '../../domain/user/hashed-password.vo';
import { User } from '../../domain/user/user';
import { UserIdentifier } from '../../domain/user/user.identifier';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findById(id: UserIdentifier): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id: id.toString() });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOneBy({
      email: email.toString(),
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    await this.repository.save(this.toOrmEntity(user));
  }

  private toDomain(entity: UserOrmEntity): User {
    return User.fromPersistence({
      id: UserIdentifier.fromString(entity.id),
      email: Email.fromString(entity.email),
      password: HashedPassword.fromString(entity.password),
      status: entity.status,
    });
  }

  private toOrmEntity(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.getIdentifier().toString();
    entity.email = user.getEmail().toString();
    entity.password = user.getPassword().toString();
    entity.status = user.getStatus();
    return entity;
  }
}

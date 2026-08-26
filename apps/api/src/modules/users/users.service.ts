import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string, gymId: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email, gymId } });
  }

  async findByGym(gymId: string): Promise<UserEntity[]> {
    return this.usersRepository.find({ where: { gymId } });
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}

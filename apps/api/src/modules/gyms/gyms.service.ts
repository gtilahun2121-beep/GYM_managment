import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymEntity } from './entities/gym.entity';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(GymEntity)
    private gymsRepository: Repository<GymEntity>
  ) {}

  async create(createGymDto: CreateGymDto): Promise<GymEntity> {
    const gym = this.gymsRepository.create(createGymDto);
    return this.gymsRepository.save(gym);
  }

  async findAll(): Promise<GymEntity[]> {
    return this.gymsRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<GymEntity> {
    const gym = await this.gymsRepository.findOne({ where: { id } });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return gym;
  }

  async findBySlug(slug: string): Promise<GymEntity> {
    const gym = await this.gymsRepository.findOne({ where: { slug } });
    if (!gym) {
      throw new NotFoundException(`Gym with slug ${slug} not found`);
    }
    return gym;
  }

  async update(id: string, updateGymDto: UpdateGymDto): Promise<GymEntity> {
    await this.gymsRepository.update(id, updateGymDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.gymsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
  }
}

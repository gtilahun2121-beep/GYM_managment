import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GymsService } from './gyms.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Gyms')
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Post()
  async create(@Body() createGymDto: CreateGymDto) {
    return this.gymsService.create(createGymDto);
  }

  @Get()
  async findAll() {
    return this.gymsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.gymsService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.gymsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateGymDto: UpdateGymDto
  ) {
    return this.gymsService.update(id, updateGymDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    await this.gymsService.delete(id);
    return { success: true, message: 'Gym deleted successfully' };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { dataSource } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USER', 'gym_admin'),
          password: configService.get('DB_PASSWORD', 'password'),
          database: configService.get('DB_NAME', 'gym_system'),
          entities: ['dist/**/*.entity.js'],
          migrations: ['dist/database/migrations/*.js'],
          synchronize: configService.get('NODE_ENV') === 'development' && false,
          logging: configService.get('NODE_ENV') === 'development',
          ssl: configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false
        };
      }
    })
  ]
})
export class DatabaseModule {}

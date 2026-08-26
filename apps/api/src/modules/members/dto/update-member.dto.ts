import { IsEmail, IsString, IsDate, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other', 'Prefer not to say'])
  gender?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  healthNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fitnessGoals?: string[];
}

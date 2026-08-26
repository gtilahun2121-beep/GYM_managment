import { IsEmail, IsString, IsDate, IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemberDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

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

  @IsUUID()
  membershipPlanId: string;

  @IsOptional()
  @IsUUID()
  referredByCode?: string;

  @IsOptional()
  @IsUUID()
  familyParentMemberId?: string;
}

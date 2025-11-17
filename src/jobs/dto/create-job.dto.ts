import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { VALIDATION_RULES } from '../../common/constants/validation.constant';

export class CreateJobDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Backend Engineer',
    minLength: VALIDATION_RULES.job.title.minLength,
    maxLength: VALIDATION_RULES.job.title.maxLength,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_RULES.job.title.minLength)
  @MaxLength(VALIDATION_RULES.job.title.maxLength)
  title: string;

  @ApiProperty({
    description: 'Job location',
    example: 'San Francisco, CA',
    minLength: VALIDATION_RULES.job.location.minLength,
    maxLength: VALIDATION_RULES.job.location.maxLength,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_RULES.job.location.minLength)
  @MaxLength(VALIDATION_RULES.job.location.maxLength)
  location: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'LoadUp Inc.',
    minLength: VALIDATION_RULES.job.customer.minLength,
    maxLength: VALIDATION_RULES.job.customer.maxLength,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_RULES.job.customer.minLength)
  @MaxLength(VALIDATION_RULES.job.customer.maxLength)
  customer: string;

  @ApiProperty({
    description: 'Job name',
    example: 'Backend-2024-Q1',
    minLength: VALIDATION_RULES.job.jobName.minLength,
    maxLength: VALIDATION_RULES.job.jobName.maxLength,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_RULES.job.jobName.minLength)
  @MaxLength(VALIDATION_RULES.job.jobName.maxLength)
  jobName: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for a senior backend engineer...',
    minLength: VALIDATION_RULES.job.description.minLength,
    maxLength: VALIDATION_RULES.job.description.maxLength,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_RULES.job.description.minLength)
  @MaxLength(VALIDATION_RULES.job.description.maxLength)
  description: string;

  @ApiProperty({
    description: 'List of questions for this job',
    type: [CreateQuestionDto],
    minItems: VALIDATION_RULES.job.questions.minItems,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ArrayMinSize(VALIDATION_RULES.job.questions.minItems)
  questions: CreateQuestionDto[];
}

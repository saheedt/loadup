import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubmitAnswerDto } from './submit-answer.dto';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Candidate full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  candidateName: string;

  @ApiProperty({
    description: 'Candidate email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  candidateEmail: string;

  @ApiProperty({
    description:
      'Array of answers to job questions. Each answer must match the question type:\n' +
      '- TEXT: string value\n' +
      '- NUMBER: numeric value\n' +
      '- SINGLE_CHOICE: string (one option)\n' +
      '- MULTI_CHOICE: string[] (multiple options)',
    type: [SubmitAnswerDto],
    example: [
      {
        questionId: '123e4567-e89b-12d3-a456-426614174001',
        value:
          'I have 5 years of experience with TypeScript, building scalable Node.js APIs and backend systems',
      },
      {
        questionId: '123e4567-e89b-12d3-a456-426614174002',
        value: 5,
      },
      {
        questionId: '123e4567-e89b-12d3-a456-426614174003',
        value: 'PostgreSQL',
      },
      {
        questionId: '123e4567-e89b-12d3-a456-426614174004',
        value: ['TypeScript', 'Python'],
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

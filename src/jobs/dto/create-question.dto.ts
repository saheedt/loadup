import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  ValidateIf,
  MinLength,
  IsArray,
} from 'class-validator';
import { QuestionType } from '../../common/enums/question-type.enum';
import type { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is your experience with TypeScript?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text: string;

  @ApiProperty({
    description: 'Type of question',
    enum: QuestionType,
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'Options for single_choice or multi_choice questions',
    example: ['Option A', 'Option B', 'Option C'],
    required: false,
    type: [String],
  })
  @ValidateIf((o: CreateQuestionDto) =>
    [QuestionType.SINGLE_CHOICE, QuestionType.MULTI_CHOICE].includes(o.type),
  )
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  options?: string[];

  @ApiProperty({
    description: 'Scoring configuration for the question',
    example: {
      points: 10,
      keywords: ['typescript', 'javascript', 'nodejs'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  scoring: ScoringConfig;
}

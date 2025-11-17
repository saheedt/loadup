import { ApiProperty } from '@nestjs/swagger';
import type { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';

export class QuestionResponseDto {
  @ApiProperty({ description: 'Question ID' })
  id: string;

  @ApiProperty({ description: 'Question text' })
  text: string;

  @ApiProperty({ description: 'Question type' })
  type: string;

  @ApiProperty({
    description: 'Options for single_choice or multi_choice questions',
    required: false,
    type: [String],
  })
  options?: string[];

  @ApiProperty({
    description: 'Scoring configuration',
    example: { points: 10, keywords: ['nodejs', 'typescript'] },
  })
  scoring: ScoringConfig;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class JobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Job location' })
  location: string;

  @ApiProperty({ description: 'Customer name' })
  customer: string;

  @ApiProperty({ description: 'Job name' })
  jobName: string;

  @ApiProperty({ description: 'Job description' })
  description: string;

  @ApiProperty({
    description: 'List of questions',
    type: [QuestionResponseDto],
  })
  questions: QuestionResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

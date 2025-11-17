import { ApiProperty } from '@nestjs/swagger';

export class AnswerBreakdownDto {
  @ApiProperty({ description: 'Question ID' })
  questionId: string;

  @ApiProperty({ description: 'Question text' })
  questionText: string;

  @ApiProperty({
    description: 'Candidate answer',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  answer: string | number | string[];

  @ApiProperty({ description: 'Score received for this answer' })
  score: number;

  @ApiProperty({ description: 'Maximum possible score for this question' })
  maxScore: number;
}

export class ApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Job ID' })
  jobId: string;

  @ApiProperty({ description: 'Candidate name' })
  candidateName: string;

  @ApiProperty({ description: 'Candidate email' })
  candidateEmail: string;

  @ApiProperty({ description: 'Total score achieved' })
  totalScore: number;

  @ApiProperty({ description: 'Maximum possible score' })
  maxScore: number;

  @ApiProperty({ description: 'Score percentage', example: 85.5 })
  scorePercentage: number;

  @ApiProperty({
    description: 'Detailed breakdown of each answer and score',
    type: [AnswerBreakdownDto],
  })
  answers: AnswerBreakdownDto[];

  @ApiProperty({ description: 'Submission timestamp' })
  createdAt: Date;
}

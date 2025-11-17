import { ApiProperty } from '@nestjs/swagger';

export class ApplicationListItemDto {
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

  @ApiProperty({ description: 'Submission timestamp' })
  createdAt: Date;
}

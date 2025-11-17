import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'Question ID this answer is for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description:
      'Answer value (type depends on question type):\n' +
      '- TEXT questions: string (e.g., "I have 5 years of TypeScript experience")\n' +
      '- NUMBER questions: number (e.g., 5)\n' +
      '- SINGLE_CHOICE questions: string (e.g., "Option A")\n' +
      '- MULTI_CHOICE questions: string[] (e.g., ["Option A", "Option C"])',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'array', items: { type: 'string' } },
    ],
    examples: {
      text: {
        value: 'I have 5 years of experience with TypeScript and Node.js',
        summary: 'Text answer',
      },
      number: {
        value: 5,
        summary: 'Number answer',
      },
      single_choice: {
        value: 'PostgreSQL',
        summary: 'Single choice answer',
      },
      multi_choice: {
        value: ['TypeScript', 'Python'],
        summary: 'Multi choice answer',
      },
    },
  })
  @ValidateIf((o: SubmitAnswerDto) => o.value !== undefined)
  @IsNotEmpty()
  value: string | number | string[];
}

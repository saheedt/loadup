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
    description: 'Answer value (type depends on question type)',
    example: 'Option A',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  @ValidateIf((o: SubmitAnswerDto) => o.value !== undefined)
  @IsNotEmpty()
  value: string | number | string[];
}

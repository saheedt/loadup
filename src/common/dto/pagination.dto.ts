import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION_CONFIG, VALIDATION_RULES } from '../constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: VALIDATION_RULES.pagination.page.min,
    default: PAGINATION_CONFIG.defaultPage,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_RULES.pagination.page.min)
  page: number = PAGINATION_CONFIG.defaultPage;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: VALIDATION_RULES.pagination.limit.min,
    maximum: VALIDATION_RULES.pagination.limit.max,
    default: PAGINATION_CONFIG.defaultLimit,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_RULES.pagination.limit.min)
  @Max(VALIDATION_RULES.pagination.limit.max)
  limit: number = PAGINATION_CONFIG.defaultLimit;
}

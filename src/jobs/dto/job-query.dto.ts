import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JobSortField } from '../../common/enums/job-sort-field.enum';
import { SortOrder } from '../../common/enums/sort-order.enum';

export class JobQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: JobSortField,
    example: JobSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(JobSortField)
  sortBy?: JobSortField = JobSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}

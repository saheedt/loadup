import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { SortOrder } from '../../common/enums/sort-order.enum';

export enum ApplicationSortField {
  SCORE = 'score',
  CREATED_AT = 'createdAt',
}

export class ListApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ApplicationSortField,
    default: ApplicationSortField.SCORE,
  })
  @IsOptional()
  @IsEnum(ApplicationSortField)
  @Type(() => String)
  sortBy?: ApplicationSortField = ApplicationSortField.SCORE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  @Type(() => String)
  order?: SortOrder = SortOrder.DESC;
}

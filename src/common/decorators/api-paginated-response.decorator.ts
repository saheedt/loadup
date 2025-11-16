import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiOkResponse({
      description: 'Paginated response with metadata',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              page: {
                type: 'number',
                example: 1,
                description: 'Current page number',
              },
              limit: {
                type: 'number',
                example: 10,
                description: 'Number of items per page',
              },
              total: {
                type: 'number',
                example: 100,
                description: 'Total number of items',
              },
              totalPages: {
                type: 'number',
                example: 10,
                description: 'Total number of pages',
              },
            },
          },
        ],
      },
    }),
  );
};

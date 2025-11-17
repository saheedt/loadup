import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { ApplicationListItemDto } from './dto/application-list-item.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

@ApiTags('applications')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId/apply')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new SanitizationPipe())
  @ApiOperation({ summary: 'Submit an application for a job' })
  @ApiParam({
    name: 'jobId',
    description: 'ID of the job to apply for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully with score breakdown',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  create(
    @Param('jobId') jobId: string,
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.create(jobId, createApplicationDto);
  }

  @Get('jobs/:jobId/applications')
  @ApiOperation({
    summary: 'Get all applications for a job with pagination and sorting',
  })
  @ApiParam({
    name: 'jobId',
    description: 'ID of the job',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiPaginatedResponse(ApplicationListItemDto)
  findAllByJob(
    @Param('jobId') jobId: string,
    @Query() query: ListApplicationsQueryDto,
  ) {
    return this.applicationsService.findAllByJob(jobId, query);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get an application by ID with score breakdown' })
  @ApiParam({
    name: 'id',
    description: 'Application ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Application found',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string): Promise<ApplicationResponseDto> {
    return this.applicationsService.findOne(id);
  }
}

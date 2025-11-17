import {
  Controller,
  Get,
  Post,
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
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, JobQueryDto, JobResponseDto } from './dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new SanitizationPipe())
  @ApiOperation({ summary: 'Create a new job posting with questions' })
  @ApiCreatedResponse({
    description: 'Job successfully created',
    type: JobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createJobDto: CreateJobDto): Promise<JobResponseDto> {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with pagination and sorting' })
  @ApiPaginatedResponse(JobResponseDto)
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID', type: String })
  @ApiOkResponse({
    description: 'Job found',
    type: JobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }
}

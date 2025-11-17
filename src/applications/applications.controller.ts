import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationResponseDto } from './dto/application-response.dto';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

@ApiTags('applications')
@Controller('jobs')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(':jobId/apply')
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
}

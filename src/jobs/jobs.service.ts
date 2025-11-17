import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { JobSortField } from '../common/enums/job-sort-field.enum';
import { SortOrder } from '../common/enums/sort-order.enum';
import type { ScoringConfig } from '../common/interfaces/scoring-strategy.interface';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto): Promise<JobResponseDto> {
    const { questions, ...jobData } = createJobDto;

    const job = await this.prisma.$transaction(async (tx) => {
      const createdJob = await tx.job.create({
        data: {
          ...jobData,
          questions: {
            create: questions.map((question) => ({
              text: question.text,
              type: question.type,
              options: question.options?.join(','),
              scoring: JSON.stringify(question.scoring),
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      return createdJob;
    });

    return this.transformJobResponse(job);
  }

  async findAll(
    query: JobQueryDto,
  ): Promise<PaginatedResponseDto<JobResponseDto>> {
    const {
      page,
      limit,
      sortBy = JobSortField.CREATED_AT,
      order = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const orderByMap: Record<JobSortField, Prisma.JobOrderByWithRelationInput> =
      {
        [JobSortField.CREATED_AT]: { createdAt: order },
        [JobSortField.LOCATION]: { location: order },
        [JobSortField.CUSTOMER]: { customer: order },
      };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take,
        orderBy: orderByMap[sortBy],
        include: {
          questions: true,
        },
      }),
      this.prisma.job.count(),
    ]);

    const transformedJobs = jobs.map((job) => this.transformJobResponse(job));
    return new PaginatedResponseDto(transformedJobs, page, limit, total);
  }

  async findOne(id: string): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!job) {
      throw new NotFoundException(ERROR_MESSAGES.job.notFound);
    }

    return this.transformJobResponse(job);
  }

  private transformJobResponse(
    job: Prisma.JobGetPayload<{ include: { questions: true } }>,
  ): JobResponseDto {
    return {
      ...job,
      questions: job.questions.map((question) => ({
        ...question,
        options: question.options ? question.options.split(',') : undefined,
        scoring: JSON.parse(question.scoring) as ScoringConfig,
      })),
    };
  }
}

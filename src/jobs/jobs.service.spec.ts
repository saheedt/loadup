import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../database/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { QuestionType } from '../common/enums/question-type.enum';
import { JobSortField } from '../common/enums/job-sort-field.enum';
import { SortOrder } from '../common/enums/sort-order.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

describe('JobsService', () => {
  let service: JobsService;

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a job with questions in a transaction', async () => {
      const createJobDto: CreateJobDto = {
        title: 'Senior Backend Engineer',
        location: 'San Francisco',
        customer: 'LoadUp',
        jobName: 'Backend-2024',
        description: 'Backend engineer position',
        questions: [
          {
            text: 'What is your experience?',
            type: QuestionType.TEXT,
            scoring: { points: 10, keywords: ['nodejs', 'typescript'] },
          },
        ],
      };

      const mockJob = {
        id: '123',
        title: createJobDto.title,
        location: createJobDto.location,
        customer: createJobDto.customer,
        jobName: createJobDto.jobName,
        description: createJobDto.description,
        questions: [
          {
            id: 'q1',
            jobId: '123',
            text: 'What is your experience?',
            type: QuestionType.TEXT,
            options: null,
            scoring: JSON.stringify({
              points: 10,
              keywords: ['nodejs', 'typescript'],
            }),
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockPrismaService) => Promise<typeof mockJob>) =>
          callback(mockPrismaService),
      );
      mockPrismaService.job.create.mockResolvedValue(mockJob);

      const result = await service.create(createJobDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.id).toBe('123');
      expect(result.title).toBe(createJobDto.title);
      expect(result.questions[0].options).toBeUndefined();
      expect(result.questions[0].scoring).toEqual({
        points: 10,
        keywords: ['nodejs', 'typescript'],
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated jobs with default sorting', async () => {
      const query: JobQueryDto = {
        page: 1,
        limit: 10,
        sortBy: JobSortField.CREATED_AT,
        order: SortOrder.DESC,
      };

      const mockJobs = [
        {
          id: '1',
          title: 'Job 1',
          location: 'SF',
          customer: 'Customer 1',
          jobName: 'Job-1',
          description: 'Description',
          questions: [
            {
              id: 'q1',
              jobId: '1',
              text: 'Test question',
              type: 'text',
              options: 'A,B,C',
              scoring: '{}',
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.job.findMany.mockResolvedValue(mockJobs);
      mockPrismaService.job.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
      expect(result.data[0].questions[0].options).toEqual(['A', 'B', 'C']);
      expect(result.data[0].questions[0].scoring).toEqual({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should support sorting by location', async () => {
      const query: JobQueryDto = {
        page: 1,
        limit: 10,
        sortBy: JobSortField.LOCATION,
        order: SortOrder.ASC,
      };

      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          location: SortOrder.ASC,
        },
        include: {
          questions: true,
        },
      });
    });

    it('should support sorting by customer', async () => {
      const query: JobQueryDto = {
        page: 2,
        limit: 5,
        sortBy: JobSortField.CUSTOMER,
        order: SortOrder.DESC,
      };

      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: {
          customer: SortOrder.DESC,
        },
        include: {
          questions: true,
        },
      });
    });

    it('should calculate pagination offset correctly', async () => {
      const query: JobQueryDto = {
        page: 3,
        limit: 20,
        sortBy: JobSortField.CREATED_AT,
        order: SortOrder.DESC,
      };

      mockPrismaService.job.findMany.mockResolvedValue([]);
      mockPrismaService.job.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        skip: 40,
        take: 20,
        orderBy: {
          createdAt: SortOrder.DESC,
        },
        include: {
          questions: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const mockJob = {
        id: '123',
        title: 'Job Title',
        location: 'SF',
        customer: 'Customer',
        jobName: 'Job-1',
        description: 'Description',
        questions: [
          {
            id: 'q1',
            jobId: '123',
            text: 'Question',
            type: 'text',
            options: null,
            scoring: '{}',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('123');

      expect(mockPrismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          questions: true,
        },
      });
      expect(result.id).toBe('123');
      expect(result.questions[0].options).toBeUndefined();
      expect(result.questions[0].scoring).toEqual({});
    });

    it('should throw NotFoundException when job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        ERROR_MESSAGES.job.notFound,
      );
    });
  });
});

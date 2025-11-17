import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { QuestionType } from '../common/enums/question-type.enum';
import { JobSortField } from '../common/enums/job-sort-field.enum';
import { SortOrder } from '../common/enums/sort-order.enum';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { JobResponseDto } from './dto/job-response.dto';

describe('JobsController', () => {
  let controller: JobsController;

  const mockJobsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new job', async () => {
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

      const mockResponse: JobResponseDto = {
        id: '123',
        title: createJobDto.title,
        location: createJobDto.location,
        customer: createJobDto.customer,
        jobName: createJobDto.jobName,
        description: createJobDto.description,
        questions: [
          {
            id: 'q1',
            text: 'What is your experience?',
            type: QuestionType.TEXT,
            options: undefined,
            scoring: {
              points: 10,
              keywords: ['nodejs', 'typescript'],
            },
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJobsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createJobDto);

      expect(mockJobsService.create).toHaveBeenCalledWith(createJobDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated jobs', async () => {
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
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = new PaginatedResponseDto(mockJobs, 1, 10, 1);

      mockJobsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(mockJobsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const mockJob: JobResponseDto = {
        id: '123',
        title: 'Job Title',
        location: 'SF',
        customer: 'Customer',
        jobName: 'Job-1',
        description: 'Description',
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJobsService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('123');

      expect(mockJobsService.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockJob);
    });
  });
});

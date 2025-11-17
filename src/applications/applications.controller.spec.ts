import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';
import { ApplicationSortField } from './dto/list-applications-query.dto';
import { SortOrder } from '../common/enums/sort-order.enum';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let sanitizationPipe: SanitizationPipe;

  const mockApplicationsService = {
    create: jest.fn(),
    findAllByJob: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
        SanitizationPipe,
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    sanitizationPipe = module.get<SanitizationPipe>(SanitizationPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should submit an application successfully', async () => {
      const jobId = '123e4567-e89b-12d3-a456-426614174000';
      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'I have 5 years of TypeScript experience',
          },
        ],
      };

      const mockResponse = {
        id: 'app1',
        jobId,
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        totalScore: 8,
        maxScore: 10,
        scorePercentage: 80,
        answers: [
          {
            questionId: 'q1',
            questionText: 'What is your experience?',
            answer: 'I have 5 years of TypeScript experience',
            score: 8,
            maxScore: 10,
          },
        ],
        createdAt: new Date(),
      };

      mockApplicationsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(jobId, createDto);

      expect(mockApplicationsService.create).toHaveBeenCalledWith(
        jobId,
        createDto,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should sanitize HTML in answers', () => {
      const input = {
        candidateName: 'John<script>alert("xss")</script>Doe',
        candidateEmail: 'test@test.com',
        answers: [
          {
            questionId: 'q1',
            value: '<img src="">Option C',
          },
          {
            questionId: 'q2',
            value: ['Option A<script>alert(1)</script>', 'Option B'],
          },
        ],
      };

      const sanitized = sanitizationPipe.transform(input, { type: 'body' });

      expect(sanitized).toEqual({
        candidateName: 'JohnDoe',
        candidateEmail: 'test@test.com',
        answers: [
          {
            questionId: 'q1',
            value: 'Option C',
          },
          {
            questionId: 'q2',
            value: ['Option A', 'Option B'],
          },
        ],
      });
    });
  });

  describe('findAllByJob', () => {
    it('should return paginated applications for a job', async () => {
      const jobId = '123e4567-e89b-12d3-a456-426614174000';
      const query = {
        page: 1,
        limit: 10,
        sortBy: ApplicationSortField.SCORE,
        order: SortOrder.DESC,
      };

      const mockResponse = {
        data: [
          {
            id: 'app1',
            jobId,
            candidateName: 'Alice',
            candidateEmail: 'alice@example.com',
            totalScore: 90,
            maxScore: 100,
            scorePercentage: 90,
            createdAt: new Date(),
          },
          {
            id: 'app2',
            jobId,
            candidateName: 'Bob',
            candidateEmail: 'bob@example.com',
            totalScore: 80,
            maxScore: 100,
            scorePercentage: 80,
            createdAt: new Date(),
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      };

      mockApplicationsService.findAllByJob.mockResolvedValue(mockResponse);

      const result = await controller.findAllByJob(jobId, query);

      expect(mockApplicationsService.findAllByJob).toHaveBeenCalledWith(
        jobId,
        query,
      );
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      const jobId = '123e4567-e89b-12d3-a456-426614174000';
      const query = {
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      mockApplicationsService.findAllByJob.mockResolvedValue(mockResponse);

      const result = await controller.findAllByJob(jobId, query);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass sorting parameters correctly', async () => {
      const jobId = '123e4567-e89b-12d3-a456-426614174000';
      const query = {
        page: 2,
        limit: 20,
        sortBy: ApplicationSortField.CREATED_AT,
        order: SortOrder.ASC,
      };

      const mockResponse = {
        data: [],
        page: 2,
        limit: 20,
        total: 0,
        totalPages: 0,
      };

      mockApplicationsService.findAllByJob.mockResolvedValue(mockResponse);

      await controller.findAllByJob(jobId, query);

      expect(mockApplicationsService.findAllByJob).toHaveBeenCalledWith(
        jobId,
        query,
      );
    });
  });

  describe('findOne', () => {
    it('should return an application by ID with score breakdown', async () => {
      const applicationId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = {
        id: applicationId,
        jobId: 'job123',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        totalScore: 8,
        maxScore: 10,
        scorePercentage: 80,
        answers: [
          {
            questionId: 'q1',
            questionText: 'What is your experience?',
            answer: 'I have 5 years of TypeScript experience',
            score: 8,
            maxScore: 10,
          },
        ],
        createdAt: new Date(),
      };

      mockApplicationsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(applicationId);

      expect(mockApplicationsService.findOne).toHaveBeenCalledWith(
        applicationId,
      );
      expect(result).toEqual(mockResponse);
      expect(result.answers).toHaveLength(1);
    });

    it('should pass application ID correctly', async () => {
      const applicationId = 'app-xyz-123';
      const mockResponse = {
        id: applicationId,
        jobId: 'job123',
        candidateName: 'Jane Doe',
        candidateEmail: 'jane@example.com',
        totalScore: 10,
        maxScore: 10,
        scorePercentage: 100,
        answers: [],
        createdAt: new Date(),
      };

      mockApplicationsService.findOne.mockResolvedValue(mockResponse);

      await controller.findOne(applicationId);

      expect(mockApplicationsService.findOne).toHaveBeenCalledWith(
        applicationId,
      );
    });
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../database/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QuestionType } from '../common/enums/question-type.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockPrismaService = {
    job: {
      findUnique: jest.fn(),
    },
    application: {
      create: jest.fn(),
    },
  };

  const mockScoringService = {
    getScorer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ScoringService,
          useValue: mockScoringService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const jobId = '123';
    const mockJob = {
      id: jobId,
      title: 'Software Engineer',
      location: 'San Francisco',
      customer: 'LoadUp',
      jobName: 'SE-2024',
      description: 'Great job',
      questions: [
        {
          id: 'q1',
          jobId,
          text: 'What is your experience with TypeScript?',
          type: QuestionType.TEXT,
          options: null,
          scoring: JSON.stringify({
            points: 10,
            keywords: ['typescript', 'nodejs'],
          }),
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an application with correct score calculation', async () => {
      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'I have 5 years of TypeScript and Node.js experience',
          },
        ],
      };

      const mockScorer = {
        score: jest.fn().mockReturnValue({ score: 10, maxScore: 10 }),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockScoringService.getScorer.mockReturnValue(mockScorer);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app1',
        jobId,
        candidateName: createDto.candidateName,
        candidateEmail: createDto.candidateEmail,
        answers: JSON.stringify([
          {
            questionId: 'q1',
            questionText: mockJob.questions[0].text,
            answer: createDto.answers[0].value,
            score: 10,
            maxScore: 10,
          },
        ]),
        totalScore: 10,
        maxScore: 10,
        createdAt: new Date(),
      });

      const result = await service.create(jobId, createDto);

      expect(mockPrismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: jobId },
        include: { questions: true },
      });
      expect(result.totalScore).toBe(10);
      expect(result.maxScore).toBe(10);
      expect(result.scorePercentage).toBe(100);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [],
      };

      await expect(service.create('nonexistent', createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('nonexistent', createDto)).rejects.toThrow(
        ERROR_MESSAGES.job.notFound,
      );
    });

    it('should throw BadRequestException when answer count does not match question count', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [], // Empty answers
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Expected 1 answers, but received 0',
      );
    });

    it('should throw BadRequestException when questionId does not exist in job', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'invalid-question-id',
            value: 'Some answer',
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Question with ID invalid-question-id not found in this job',
      );
    });

    it('should throw BadRequestException for single choice with non-string answer', async () => {
      const singleChoiceJob = {
        ...mockJob,
        questions: [
          {
            ...mockJob.questions[0],
            type: QuestionType.SINGLE_CHOICE,
          },
        ],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(singleChoiceJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 123 as any, // Invalid: number instead of string
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Single choice answer must be a string',
      );
    });

    it('should throw BadRequestException for multi choice with non-array answer', async () => {
      const multiChoiceJob = {
        ...mockJob,
        questions: [
          {
            ...mockJob.questions[0],
            type: QuestionType.MULTI_CHOICE,
          },
        ],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(multiChoiceJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'not an array' as any,
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Multi choice answer must be an array of strings',
      );
    });

    it('should throw BadRequestException for multi choice with array of non-strings', async () => {
      const multiChoiceJob = {
        ...mockJob,
        questions: [
          {
            ...mockJob.questions[0],
            type: QuestionType.MULTI_CHOICE,
          },
        ],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(multiChoiceJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: [1, 2, 3] as any, // Invalid: numbers instead of strings
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Multi choice answer must be an array of strings',
      );
    });

    it('should throw BadRequestException for number question with non-number answer', async () => {
      const numberJob = {
        ...mockJob,
        questions: [
          {
            ...mockJob.questions[0],
            type: QuestionType.NUMBER,
          },
        ],
      };

      mockPrismaService.job.findUnique.mockResolvedValue(numberJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'not a number' as any,
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Number answer must be a number',
      );
    });

    it('should throw BadRequestException for text question with non-string answer', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 123 as any, // Invalid: number instead of string
          },
        ],
      };

      await expect(service.create(jobId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(jobId, createDto)).rejects.toThrow(
        'Text answer must be a string',
      );
    });

    it('should calculate score percentage correctly', async () => {
      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'I know TypeScript',
          },
        ],
      };

      const mockScorer = {
        score: jest.fn().mockReturnValue({ score: 5, maxScore: 10 }),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockScoringService.getScorer.mockReturnValue(mockScorer);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app1',
        jobId,
        candidateName: createDto.candidateName,
        candidateEmail: createDto.candidateEmail,
        answers: JSON.stringify([]),
        totalScore: 5,
        maxScore: 10,
        createdAt: new Date(),
      });

      const result = await service.create(jobId, createDto);

      expect(result.scorePercentage).toBe(50);
    });

    it('should handle zero max score edge case', async () => {
      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'Answer',
          },
        ],
      };

      const mockScorer = {
        score: jest.fn().mockReturnValue({ score: 0, maxScore: 0 }),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockScoringService.getScorer.mockReturnValue(mockScorer);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app1',
        jobId,
        candidateName: createDto.candidateName,
        candidateEmail: createDto.candidateEmail,
        answers: JSON.stringify([]),
        totalScore: 0,
        maxScore: 0,
        createdAt: new Date(),
      });

      const result = await service.create(jobId, createDto);

      expect(result.scorePercentage).toBe(0);
    });

    it('should handle multiple questions correctly', async () => {
      const multiQuestionJob = {
        ...mockJob,
        questions: [
          {
            id: 'q1',
            jobId,
            text: 'Question 1',
            type: QuestionType.TEXT,
            options: null,
            scoring: JSON.stringify({ points: 10, keywords: ['test'] }),
            createdAt: new Date(),
          },
          {
            id: 'q2',
            jobId,
            text: 'Question 2',
            type: QuestionType.NUMBER,
            options: null,
            scoring: JSON.stringify({ points: 5, min: 1, max: 10 }),
            createdAt: new Date(),
          },
        ],
      };

      const createDto: CreateApplicationDto = {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        answers: [
          {
            questionId: 'q1',
            value: 'test answer',
          },
          {
            questionId: 'q2',
            value: 5,
          },
        ],
      };

      const mockTextScorer = {
        score: jest.fn().mockReturnValue({ score: 10, maxScore: 10 }),
      };
      const mockNumberScorer = {
        score: jest.fn().mockReturnValue({ score: 5, maxScore: 5 }),
      };

      mockPrismaService.job.findUnique.mockResolvedValue(multiQuestionJob);
      mockScoringService.getScorer
        .mockReturnValueOnce(mockTextScorer)
        .mockReturnValueOnce(mockNumberScorer);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app1',
        jobId,
        candidateName: createDto.candidateName,
        candidateEmail: createDto.candidateEmail,
        answers: JSON.stringify([]),
        totalScore: 15,
        maxScore: 15,
        createdAt: new Date(),
      });

      const result = await service.create(jobId, createDto);

      expect(result.totalScore).toBe(15);
      expect(result.maxScore).toBe(15);
      expect(result.scorePercentage).toBe(100);
    });
  });
});

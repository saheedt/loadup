import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let sanitizationPipe: SanitizationPipe;

  const mockApplicationsService = {
    create: jest.fn(),
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
});

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  ApplicationResponseDto,
  AnswerBreakdownDto,
} from './dto/application-response.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { QuestionType } from '../common/enums/question-type.enum';
import type { ScoringConfig } from '../common/interfaces/scoring-strategy.interface';

type QuestionWithRelations = Prisma.QuestionGetPayload<{
  select: {
    id: true;
    text: true;
    type: true;
    scoring: true;
  };
}>;

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  async create(
    jobId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { questions: true },
    });

    if (!job) {
      throw new NotFoundException(ERROR_MESSAGES.job.notFound);
    }

    this.validateAnswers(createApplicationDto.answers, job.questions);

    const scoreBreakdown = this.calculateScores(
      createApplicationDto.answers,
      job.questions,
    );

    const totalScore = scoreBreakdown.reduce(
      (sum, answer) => sum + answer.score,
      0,
    );
    const maxScore = scoreBreakdown.reduce(
      (sum, answer) => sum + answer.maxScore,
      0,
    );

    const application = await this.prisma.application.create({
      data: {
        jobId,
        candidateName: createApplicationDto.candidateName,
        candidateEmail: createApplicationDto.candidateEmail,
        answers: JSON.stringify(scoreBreakdown),
        totalScore,
        maxScore,
      },
    });

    return {
      id: application.id,
      jobId: application.jobId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      totalScore: application.totalScore,
      maxScore: application.maxScore,
      scorePercentage:
        maxScore > 0
          ? parseFloat(((totalScore / maxScore) * 100).toFixed(2))
          : 0,
      answers: scoreBreakdown,
      createdAt: application.createdAt,
    };
  }

  private validateAnswers(
    answers: SubmitAnswerDto[],
    questions: QuestionWithRelations[],
  ): void {
    if (answers.length !== questions.length) {
      throw new BadRequestException(
        `Expected ${questions.length} answers, but received ${answers.length}`,
      );
    }

    const questionMap = new Map<string, QuestionWithRelations>(
      questions.map((q) => [q.id, q]),
    );

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} not found in this job`,
        );
      }

      this.validateAnswerType(answer.value, question.type);
    }
  }

  private validateAnswerType(
    value: string | number | string[],
    questionType: string,
  ): void {
    switch (questionType as QuestionType) {
      case QuestionType.SINGLE_CHOICE:
        if (typeof value !== 'string') {
          throw new BadRequestException(
            'Single choice answer must be a string',
          );
        }
        break;
      case QuestionType.MULTI_CHOICE:
        if (!Array.isArray(value)) {
          throw new BadRequestException(
            'Multi choice answer must be an array of strings',
          );
        }
        if (!value.every((v) => typeof v === 'string')) {
          throw new BadRequestException(
            'Multi choice answer must be an array of strings',
          );
        }
        break;
      case QuestionType.NUMBER:
        if (typeof value !== 'number') {
          throw new BadRequestException('Number answer must be a number');
        }
        break;
      case QuestionType.TEXT:
        if (typeof value !== 'string') {
          throw new BadRequestException('Text answer must be a string');
        }
        break;
      default:
        throw new BadRequestException(`Unknown question type: ${questionType}`);
    }
  }

  private calculateScores(
    answers: SubmitAnswerDto[],
    questions: QuestionWithRelations[],
  ): AnswerBreakdownDto[] {
    const questionMap = new Map<string, QuestionWithRelations>(
      questions.map((q) => [q.id, q]),
    );

    return answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} not found`,
        );
      }

      const scoringConfig = JSON.parse(question.scoring) as ScoringConfig;

      const scorer = this.scoringService.getScorer(
        question.type as QuestionType,
      );
      const result = scorer.score(answer.value, scoringConfig);

      return {
        questionId: question.id,
        questionText: question.text,
        answer: answer.value,
        score: result.score,
        maxScore: result.maxScore,
      };
    });
  }
}

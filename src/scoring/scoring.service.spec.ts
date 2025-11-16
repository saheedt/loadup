import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import {
  SingleChoiceScorer,
  MultiChoiceScorer,
  NumberScorer,
  TextScorer,
} from './strategies';
import { QuestionType } from '../common/enums/question-type.enum';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        SingleChoiceScorer,
        MultiChoiceScorer,
        NumberScorer,
        TextScorer,
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return SingleChoiceScorer for SINGLE_CHOICE type', () => {
    const scorer = service.getScorer(QuestionType.SINGLE_CHOICE);
    expect(scorer).toBeInstanceOf(SingleChoiceScorer);
  });

  it('should return MultiChoiceScorer for MULTI_CHOICE type', () => {
    const scorer = service.getScorer(QuestionType.MULTI_CHOICE);
    expect(scorer).toBeInstanceOf(MultiChoiceScorer);
  });

  it('should return NumberScorer for NUMBER type', () => {
    const scorer = service.getScorer(QuestionType.NUMBER);
    expect(scorer).toBeInstanceOf(NumberScorer);
  });

  it('should return TextScorer for TEXT type', () => {
    const scorer = service.getScorer(QuestionType.TEXT);
    expect(scorer).toBeInstanceOf(TextScorer);
  });

  it('should throw error for invalid question type', () => {
    expect(() => service.getScorer('INVALID' as QuestionType)).toThrow(
      'No scorer found for question type: INVALID',
    );
  });

  it('should return the same scorer instance for repeated calls', () => {
    const scorer1 = service.getScorer(QuestionType.SINGLE_CHOICE);
    const scorer2 = service.getScorer(QuestionType.SINGLE_CHOICE);
    expect(scorer1).toBe(scorer2);
  });
});

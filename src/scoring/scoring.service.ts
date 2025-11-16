import { Injectable } from '@nestjs/common';
import { QuestionType } from '../common/enums/question-type.enum';
import { IScoringStrategy } from '../common/interfaces/scoring-strategy.interface';
import {
  SingleChoiceScorer,
  MultiChoiceScorer,
  NumberScorer,
  TextScorer,
} from './strategies';

@Injectable()
export class ScoringService {
  private readonly strategies: Map<QuestionType, IScoringStrategy>;

  constructor(
    private readonly singleChoiceScorer: SingleChoiceScorer,
    private readonly multiChoiceScorer: MultiChoiceScorer,
    private readonly numberScorer: NumberScorer,
    private readonly textScorer: TextScorer,
  ) {
    this.strategies = new Map<QuestionType, IScoringStrategy>([
      [QuestionType.SINGLE_CHOICE, this.singleChoiceScorer],
      [QuestionType.MULTI_CHOICE, this.multiChoiceScorer],
      [QuestionType.NUMBER, this.numberScorer],
      [QuestionType.TEXT, this.textScorer],
    ]);
  }

  getScorer(questionType: QuestionType): IScoringStrategy {
    const scorer = this.strategies.get(questionType);
    if (!scorer) {
      throw new Error(`No scorer found for question type: ${questionType}`);
    }
    return scorer;
  }
}

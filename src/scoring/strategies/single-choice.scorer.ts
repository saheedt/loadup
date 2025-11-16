import { Injectable } from '@nestjs/common';
import {
  IScoringStrategy,
  ScoringConfig,
  ScoringResult,
} from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

@Injectable()
export class SingleChoiceScorer implements IScoringStrategy {
  score(answer: string, config: ScoringConfig): ScoringResult {
    if (!config.correctOption) {
      throw new Error(ERROR_MESSAGES.application.invalidAnswerType);
    }

    const maxScore = config.points;
    const isCorrect = answer === config.correctOption;
    const score = isCorrect ? maxScore : 0;

    return { score, maxScore };
  }
}

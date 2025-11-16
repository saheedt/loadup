import { Injectable } from '@nestjs/common';
import {
  IScoringStrategy,
  ScoringConfig,
  ScoringResult,
} from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

@Injectable()
export class NumberScorer implements IScoringStrategy {
  score(answer: number, config: ScoringConfig): ScoringResult {
    if (config.min === undefined || config.max === undefined) {
      throw new Error(ERROR_MESSAGES.application.invalidAnswerType);
    }

    const maxScore = config.points;
    const isInRange = answer >= config.min && answer <= config.max;
    const score = isInRange ? maxScore : 0;

    return { score, maxScore };
  }
}

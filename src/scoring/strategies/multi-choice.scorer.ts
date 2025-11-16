import { Injectable } from '@nestjs/common';
import {
  IScoringStrategy,
  ScoringConfig,
  ScoringResult,
} from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

@Injectable()
export class MultiChoiceScorer implements IScoringStrategy {
  score(answer: string[], config: ScoringConfig): ScoringResult {
    if (!config.correctOptions || !Array.isArray(config.correctOptions)) {
      throw new Error(ERROR_MESSAGES.application.invalidAnswerType);
    }

    const maxScore = config.points;
    const correctSet = new Set(config.correctOptions);
    const answerSet = new Set(answer);

    if (answerSet.size === 0) {
      return { score: 0, maxScore };
    }

    const correctAnswers = Array.from(answerSet).filter((ans) =>
      correctSet.has(ans),
    ).length;
    const score = (correctAnswers / correctSet.size) * maxScore;

    return { score, maxScore };
  }
}

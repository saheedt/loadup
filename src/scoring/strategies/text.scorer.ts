import { Injectable } from '@nestjs/common';
import {
  IScoringStrategy,
  ScoringConfig,
  ScoringResult,
} from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

@Injectable()
export class TextScorer implements IScoringStrategy {
  score(answer: string, config: ScoringConfig): ScoringResult {
    if (
      !config.keywords ||
      !Array.isArray(config.keywords) ||
      config.keywords.length === 0
    ) {
      throw new Error(ERROR_MESSAGES.application.invalidAnswerType);
    }

    const maxScore = config.points;
    const answerLower = answer.toLowerCase();
    const keywordsLower = config.keywords.map((k) => k.toLowerCase());
    const matchedKeywords = keywordsLower.filter((keyword) =>
      answerLower.includes(keyword),
    );

    const score = (matchedKeywords.length / config.keywords.length) * maxScore;

    return { score, maxScore };
  }
}

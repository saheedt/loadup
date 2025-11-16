import { SingleChoiceScorer } from './single-choice.scorer';
import { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

describe('SingleChoiceScorer', () => {
  let scorer: SingleChoiceScorer;

  beforeEach(() => {
    scorer = new SingleChoiceScorer();
  });

  it('should award full points for correct answer', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOption: 'A',
    };

    const result = scorer.score('A', config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award zero points for incorrect answer', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOption: 'A',
    };

    const result = scorer.score('B', config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should be case-sensitive', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOption: 'A',
    };

    const result = scorer.score('a', config);

    expect(result.score).toBe(0);
  });

  it('should throw error if correctOption is missing', () => {
    const config: ScoringConfig = {
      points: 10,
    };

    expect(() => scorer.score('A', config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should handle different point values', () => {
    const config: ScoringConfig = {
      points: 25,
      correctOption: 'C',
    };

    const correctResult = scorer.score('C', config);
    const incorrectResult = scorer.score('D', config);

    expect(correctResult.score).toBe(25);
    expect(correctResult.maxScore).toBe(25);
    expect(incorrectResult.score).toBe(0);
    expect(incorrectResult.maxScore).toBe(25);
  });
});

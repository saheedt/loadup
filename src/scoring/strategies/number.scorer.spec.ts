import { NumberScorer } from './number.scorer';
import { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

describe('NumberScorer', () => {
  let scorer: NumberScorer;

  beforeEach(() => {
    scorer = new NumberScorer();
  });

  it('should award full points for number within range', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
      max: 15,
    };

    const result = scorer.score(10, config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award full points for number at min boundary', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
      max: 15,
    };

    const result = scorer.score(5, config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award full points for number at max boundary', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
      max: 15,
    };

    const result = scorer.score(15, config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award zero points for number below range', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
      max: 15,
    };

    const result = scorer.score(4, config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should award zero points for number above range', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
      max: 15,
    };

    const result = scorer.score(16, config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should handle negative numbers', () => {
    const config: ScoringConfig = {
      points: 10,
      min: -10,
      max: -5,
    };

    const inRangeResult = scorer.score(-7, config);
    const outOfRangeResult = scorer.score(-3, config);

    expect(inRangeResult.score).toBe(10);
    expect(outOfRangeResult.score).toBe(0);
  });

  it('should handle decimal numbers', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 0.5,
      max: 2.5,
    };

    const result = scorer.score(1.5, config);

    expect(result.score).toBe(10);
  });

  it('should throw error if min is missing', () => {
    const config: ScoringConfig = {
      points: 10,
      max: 15,
    };

    expect(() => scorer.score(10, config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should throw error if max is missing', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 5,
    };

    expect(() => scorer.score(10, config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should handle zero as valid boundary', () => {
    const config: ScoringConfig = {
      points: 10,
      min: 0,
      max: 10,
    };

    const result = scorer.score(0, config);

    expect(result.score).toBe(10);
  });
});

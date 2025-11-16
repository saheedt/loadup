import { MultiChoiceScorer } from './multi-choice.scorer';
import { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

describe('MultiChoiceScorer', () => {
  let scorer: MultiChoiceScorer;

  beforeEach(() => {
    scorer = new MultiChoiceScorer();
  });

  it('should award full points for all correct answers', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['A', 'B', 'C'], config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award partial points based on intersection', () => {
    const config: ScoringConfig = {
      points: 30,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['A', 'B'], config);

    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(30);
  });

  it('should calculate proportional score correctly', () => {
    const config: ScoringConfig = {
      points: 30,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['A'], config);

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(30);
  });

  it('should not penalize incorrect selections', () => {
    const config: ScoringConfig = {
      points: 30,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['A', 'B', 'D', 'E'], config);

    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(30);
  });

  it('should award zero points for all incorrect answers', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['D', 'E'], config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should award zero points for empty answer', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score([], config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should ignore duplicate answers', () => {
    const config: ScoringConfig = {
      points: 30,
      correctOptions: ['A', 'B', 'C'],
    };

    const result = scorer.score(['A', 'A', 'B'], config);

    expect(result.score).toBe(20);
  });

  it('should throw error if correctOptions is missing', () => {
    const config: ScoringConfig = {
      points: 10,
    };

    expect(() => scorer.score(['A'], config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should throw error if correctOptions is not an array', () => {
    const config: ScoringConfig = {
      points: 10,
      correctOptions: 'A' as unknown as string[],
    };

    expect(() => scorer.score(['A'], config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });
});

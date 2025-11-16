import { TextScorer } from './text.scorer';
import { ScoringConfig } from '../../common/interfaces/scoring-strategy.interface';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constant';

describe('TextScorer', () => {
  let scorer: TextScorer;

  beforeEach(() => {
    scorer = new TextScorer();
  });

  it('should award full points when all keywords are present', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['experience', 'leadership', 'team'],
    };

    const result = scorer.score(
      'I have experience in leadership and team management',
      config,
    );

    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });

  it('should award partial points based on keyword match ratio', () => {
    const config: ScoringConfig = {
      points: 30,
      keywords: ['experience', 'leadership', 'team'],
    };

    const result = scorer.score('I have experience in team management', config);

    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(30);
  });

  it('should award zero points when no keywords match', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['experience', 'leadership', 'team'],
    };

    const result = scorer.score('I like working on projects', config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });

  it('should be case-insensitive', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['EXPERIENCE', 'Leadership', 'TEAM'],
    };

    const result = scorer.score(
      'i have experience in leadership and team management',
      config,
    );

    expect(result.score).toBe(10);
  });

  it('should match keywords as substrings', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['lead'],
    };

    const result = scorer.score('I am a leader in my field', config);

    expect(result.score).toBe(10);
  });

  it('should throw error for empty keywords array', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: [],
    };

    expect(() => scorer.score('Some answer text', config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should handle single keyword', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['javascript'],
    };

    const matchResult = scorer.score('I love JavaScript programming', config);
    const noMatchResult = scorer.score('I love Python programming', config);

    expect(matchResult.score).toBe(10);
    expect(noMatchResult.score).toBe(0);
  });

  it('should calculate score correctly with multiple keywords', () => {
    const config: ScoringConfig = {
      points: 40,
      keywords: ['react', 'node', 'typescript', 'graphql'],
    };

    const result = scorer.score('I work with React and TypeScript', config);

    expect(result.score).toBe(20);
  });

  it('should throw error if keywords is missing', () => {
    const config: ScoringConfig = {
      points: 10,
    };

    expect(() => scorer.score('Some answer', config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should throw error if keywords is not an array', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: 'keyword' as unknown as string[],
    };

    expect(() => scorer.score('Some answer', config)).toThrow(
      ERROR_MESSAGES.application.invalidAnswerType,
    );
  });

  it('should handle empty answer', () => {
    const config: ScoringConfig = {
      points: 10,
      keywords: ['experience', 'leadership'],
    };

    const result = scorer.score('', config);

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(10);
  });
});

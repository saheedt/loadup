export interface ScoringConfig {
  points: number;
  correctOption?: string;
  correctOptions?: string[];
  min?: number;
  max?: number;
  keywords?: string[];
}

export interface ScoringResult {
  score: number;
  maxScore: number;
}

export interface IScoringStrategy {
  score(answer: any, config: ScoringConfig): ScoringResult;
}

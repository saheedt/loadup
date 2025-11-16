import { QuestionType } from '../enums';

export const QUESTION_TYPE_METADATA = {
  [QuestionType.SINGLE_CHOICE]: {
    name: 'Single Choice',
    description: 'Question with one correct answer',
    requiredScoringFields: ['correctOption', 'points'],
  },
  [QuestionType.MULTI_CHOICE]: {
    name: 'Multiple Choice',
    description: 'Question with multiple correct answers',
    requiredScoringFields: ['correctOptions', 'points'],
  },
  [QuestionType.NUMBER]: {
    name: 'Number',
    description: 'Question with numeric answer within a range',
    requiredScoringFields: ['min', 'max', 'points'],
  },
  [QuestionType.TEXT]: {
    name: 'Text',
    description: 'Question with keyword-based scoring',
    requiredScoringFields: ['keywords', 'points'],
  },
} as const;

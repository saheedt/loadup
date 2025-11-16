export const ERROR_MESSAGES = {
  job: {
    notFound: 'Job not found',
    invalidQuestionType: 'Invalid question type provided',
    noQuestions: 'Job must have at least one question',
  },
  application: {
    notFound: 'Application not found',
    answerMismatch: 'Answers must match all questions in the job',
    invalidAnswerType: 'Answer type does not match question type',
  },
  validation: {
    invalidSortField: 'Invalid sort field provided',
    invalidSortOrder: 'Sort order must be either asc or desc',
    invalidPage: 'Page number must be a positive integer',
    invalidLimit: 'Limit must be between 1 and 100',
  },
} as const;

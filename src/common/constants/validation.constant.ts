export const VALIDATION_RULES = {
  job: {
    title: {
      minLength: 3,
      maxLength: 200,
    },
    location: {
      minLength: 1,
      maxLength: 100,
    },
    customer: {
      minLength: 1,
      maxLength: 100,
    },
    jobName: {
      minLength: 1,
      maxLength: 100,
    },
    description: {
      minLength: 10,
      maxLength: 5000,
    },
    questions: {
      minItems: 1,
    },
  },
  application: {
    candidateName: {
      minLength: 2,
      maxLength: 100,
    },
    candidateEmail: {
      maxLength: 255,
    },
  },
  pagination: {
    page: {
      min: 1,
    },
    limit: {
      min: 1,
      max: 100,
    },
  },
} as const;

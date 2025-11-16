export const APP_CONFIG = {
  server: {
    defaultPort: 3000,
    globalPrefix: 'api/v1',
  },
  swagger: {
    path: 'docs',
    title: 'LoadUp Job Application API',
    description:
      'API for managing job postings, candidate applications, and automated scoring',
    version: '1.0',
  },
  validation: {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  },
} as const;

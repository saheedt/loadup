import {
  APP_CONFIG,
  ERROR_MESSAGES,
  PAGINATION_CONFIG,
  QUESTION_TYPE_METADATA,
  VALIDATION_RULES,
} from './index';
import {
  QuestionType,
  SortOrder,
  JobSortField,
  ApplicationSortField,
} from '../enums';

describe('Constants and Enums', () => {
  describe('APP_CONFIG', () => {
    it('should have server configuration', () => {
      expect(APP_CONFIG.server).toBeDefined();
      expect(APP_CONFIG.server.defaultPort).toBe(3000);
      expect(APP_CONFIG.server.globalPrefix).toBe('api/v1');
    });

    it('should have swagger configuration', () => {
      expect(APP_CONFIG.swagger).toBeDefined();
      expect(APP_CONFIG.swagger.path).toBe('docs');
      expect(APP_CONFIG.swagger.title).toBeDefined();
    });

    it('should have validation configuration', () => {
      expect(APP_CONFIG.validation).toBeDefined();
      expect(APP_CONFIG.validation.whitelist).toBe(true);
      expect(APP_CONFIG.validation.forbidNonWhitelisted).toBe(true);
    });
  });

  describe('VALIDATION_RULES', () => {
    it('should have job validation rules', () => {
      expect(VALIDATION_RULES.job).toBeDefined();
      expect(VALIDATION_RULES.job.title.minLength).toBe(3);
      expect(VALIDATION_RULES.job.description.maxLength).toBe(5000);
    });

    it('should have application validation rules', () => {
      expect(VALIDATION_RULES.application).toBeDefined();
      expect(VALIDATION_RULES.application.candidateName.minLength).toBe(2);
    });

    it('should have pagination validation rules', () => {
      expect(VALIDATION_RULES.pagination).toBeDefined();
      expect(VALIDATION_RULES.pagination.limit.max).toBe(100);
    });
  });

  describe('PAGINATION_CONFIG', () => {
    it('should have default values', () => {
      expect(PAGINATION_CONFIG.defaultPage).toBe(1);
      expect(PAGINATION_CONFIG.defaultLimit).toBe(10);
      expect(PAGINATION_CONFIG.maxLimit).toBe(100);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have job error messages', () => {
      expect(ERROR_MESSAGES.job.notFound).toBe('Job not found');
      expect(ERROR_MESSAGES.job.invalidQuestionType).toBeDefined();
    });

    it('should have application error messages', () => {
      expect(ERROR_MESSAGES.application.notFound).toBe('Application not found');
    });

    it('should have validation error messages', () => {
      expect(ERROR_MESSAGES.validation.invalidSortField).toBeDefined();
    });
  });

  describe('QUESTION_TYPE_METADATA', () => {
    it('should have metadata for all question types', () => {
      expect(QUESTION_TYPE_METADATA[QuestionType.SINGLE_CHOICE]).toBeDefined();
      expect(QUESTION_TYPE_METADATA[QuestionType.MULTI_CHOICE]).toBeDefined();
      expect(QUESTION_TYPE_METADATA[QuestionType.NUMBER]).toBeDefined();
      expect(QUESTION_TYPE_METADATA[QuestionType.TEXT]).toBeDefined();
    });

    it('should specify required scoring fields for each type', () => {
      expect(
        QUESTION_TYPE_METADATA[QuestionType.SINGLE_CHOICE]
          .requiredScoringFields,
      ).toContain('correctOption');
      expect(
        QUESTION_TYPE_METADATA[QuestionType.MULTI_CHOICE]
          .requiredScoringFields,
      ).toContain('correctOptions');
      expect(
        QUESTION_TYPE_METADATA[QuestionType.NUMBER].requiredScoringFields,
      ).toContain('min');
      expect(
        QUESTION_TYPE_METADATA[QuestionType.TEXT].requiredScoringFields,
      ).toContain('keywords');
    });
  });

  describe('Enums', () => {
    it('should have QuestionType enum values', () => {
      expect(QuestionType.SINGLE_CHOICE).toBe('single_choice');
      expect(QuestionType.MULTI_CHOICE).toBe('multi_choice');
      expect(QuestionType.NUMBER).toBe('number');
      expect(QuestionType.TEXT).toBe('text');
    });

    it('should have SortOrder enum values', () => {
      expect(SortOrder.ASC).toBe('asc');
      expect(SortOrder.DESC).toBe('desc');
    });

    it('should have JobSortField enum values', () => {
      expect(JobSortField.LOCATION).toBe('location');
      expect(JobSortField.CUSTOMER).toBe('customer');
      expect(JobSortField.CREATED_AT).toBe('createdAt');
    });

    it('should have ApplicationSortField enum values', () => {
      expect(ApplicationSortField.SCORE).toBe('score');
    });
  });
});

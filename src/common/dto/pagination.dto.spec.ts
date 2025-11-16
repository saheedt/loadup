import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination.dto';
import { PAGINATION_CONFIG, VALIDATION_RULES } from '../constants';

describe('PaginationQueryDto', () => {
  it('should use default values when no input provided', () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    expect(dto.page).toBe(PAGINATION_CONFIG.defaultPage);
    expect(dto.limit).toBe(PAGINATION_CONFIG.defaultLimit);
  });

  it('should accept valid page and limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 2, limit: 20 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('should transform string numbers to integers', () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: '3',
      limit: '15',
    });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(15);
    expect(typeof dto.page).toBe('number');
    expect(typeof dto.limit).toBe('number');
  });

  it('should reject page less than minimum', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should reject negative page', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject limit less than minimum', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should reject limit greater than maximum', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      limit: VALIDATION_RULES.pagination.limit.max + 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should accept limit at maximum boundary', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      limit: VALIDATION_RULES.pagination.limit.max,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject non-integer values', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 1.5,
      limit: 10.7,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

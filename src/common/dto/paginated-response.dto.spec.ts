import { PaginatedResponseDto } from './paginated-response.dto';

describe('PaginatedResponseDto', () => {
  it('should create paginated response with correct metadata', () => {
    const data = [1, 2, 3, 4, 5];
    const page = 1;
    const limit = 5;
    const total = 50;

    const response = new PaginatedResponseDto(data, page, limit, total);

    expect(response.data).toEqual(data);
    expect(response.page).toBe(1);
    expect(response.limit).toBe(5);
    expect(response.total).toBe(50);
    expect(response.totalPages).toBe(10);
  });

  it('should calculate totalPages correctly with remainder', () => {
    const data = [1, 2, 3];
    const response = new PaginatedResponseDto(data, 1, 10, 23);

    expect(response.totalPages).toBe(3);
  });

  it('should calculate totalPages correctly without remainder', () => {
    const data = [1, 2, 3];
    const response = new PaginatedResponseDto(data, 1, 10, 30);

    expect(response.totalPages).toBe(3);
  });

  it('should handle single page correctly', () => {
    const data = [1, 2, 3];
    const response = new PaginatedResponseDto(data, 1, 10, 3);

    expect(response.totalPages).toBe(1);
  });

  it('should handle empty results', () => {
    const data: any[] = [];
    const response = new PaginatedResponseDto(data, 1, 10, 0);

    expect(response.data).toEqual([]);
    expect(response.totalPages).toBe(0);
  });

  it('should work with different data types', () => {
    const data = [{ id: 1, name: 'Test' }];
    const response = new PaginatedResponseDto(data, 1, 10, 1);

    expect(response.data).toEqual(data);
    expect(response.totalPages).toBe(1);
  });
});

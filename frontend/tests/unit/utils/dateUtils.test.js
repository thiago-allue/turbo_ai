import { formatDate } from '../../../utils/dateUtils';

describe('formatDate utility', () => {
  beforeAll(() => {
    // Freeze time if needed
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2025-02-13T12:00:00Z'));
  });

  afterAll(() => {
    // Restore the original timer
    jest.useRealTimers();
  });

  it('returns "Today" for current date', () => {
    const today = new Date().toISOString();
    expect(formatDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for the previous day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns formatted month/day for older dates', () => {
    const olderDate = new Date('2025-02-11T10:00:00Z');
    expect(formatDate(olderDate.toISOString())).toMatch(/Feb \d{1,2}/);
  });

  it('handles empty or null input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

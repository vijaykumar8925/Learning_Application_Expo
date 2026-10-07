import { calculateProgress } from '../../src/domain/progress';

describe('calculateProgress', () => {
  it('returns 0 when total lessons is 0 to avoid division by zero', () => {
    expect(calculateProgress(0, 0)).toBe(0);
    expect(calculateProgress(5, 0)).toBe(0);
  });

  it('returns 0 when completed lessons is 0 or negative', () => {
    expect(calculateProgress(0, 20)).toBe(0);
    expect(calculateProgress(-1, 20)).toBe(0);
  });

  it('calculates exact percentages accurately (13/20 => 65%)', () => {
    expect(calculateProgress(13, 20)).toBe(65);
  });

  it('rounds to the nearest integer (6/16 => 38%)', () => {
    // 6 / 16 = 0.375 => 37.5% => rounds to 38%
    expect(calculateProgress(6, 16)).toBe(38);
  });

  it('rounds down when below .5 (1/3 => 33%)', () => {
    // 1 / 3 = 0.333... => 33%
    expect(calculateProgress(1, 3)).toBe(33);
  });

  it('returns 100 when all lessons are completed', () => {
    expect(calculateProgress(20, 20)).toBe(100);
    expect(calculateProgress(16, 16)).toBe(100);
  });

  it('never exceeds 100 even if completed exceeds total due to unexpected inputs', () => {
    expect(calculateProgress(25, 20)).toBe(100);
  });
});

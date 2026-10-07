/**
 * Pure progress calculation logic.
 *
 * Rules:
 * - 0 lessons => 0 (guards against division by zero)
 * - Rounded to nearest integer using Math.round
 * - Clamped strictly between 0 and 100
 */
export function calculateProgress(completed: number, total: number): number {
  if (total <= 0 || completed <= 0) {
    return 0;
  }
  const rawPercentage = (completed / total) * 100;
  const rounded = Math.round(rawPercentage);
  return Math.min(100, Math.max(0, rounded));
}

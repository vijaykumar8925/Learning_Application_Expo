import { Course } from '../../src/domain/models';
import {
  reduceDashboardState,
  RefreshStatus,
} from '../../src/features/dashboard/dashboardReducer';

const sampleCourses: Course[] = [
  {
    id: 1,
    title: 'Python Programming',
    instructor: 'John Smith',
    progress: 65,
    lessonCount: 20,
    completedCount: 13,
  },
];

describe('reduceDashboardState', () => {
  it('returns loading state when SQLite initial query has not resolved (courses is null)', () => {
    const status: RefreshStatus = { state: 'idle' };
    const state = reduceDashboardState(null, status);
    expect(state).toEqual({ kind: 'loading' });
  });

  describe('When cache is populated (courses.length > 0)', () => {
    it('cached courses + refresh failure => success with offlineMessage (cache is NOT replaced by error)', () => {
      const status: RefreshStatus = {
        state: 'error',
        message: 'Network connection failed',
      };
      const state = reduceDashboardState(sampleCourses, status);

      expect(state.kind).toBe('success');
      if (state.kind === 'success') {
        expect(state.courses).toEqual(sampleCourses);
        expect(state.isRefreshing).toBe(false);
        expect(state.offlineMessage).toBe(
          'Offline – showing saved data (Network connection failed)',
        );
      }
    });

    it('cached courses + refresh in progress => success with isRefreshing: true and courses visible', () => {
      const status: RefreshStatus = { state: 'refreshing' };
      const state = reduceDashboardState(sampleCourses, status);

      expect(state.kind).toBe('success');
      if (state.kind === 'success') {
        expect(state.courses).toEqual(sampleCourses);
        expect(state.isRefreshing).toBe(true);
        expect(state.offlineMessage).toBeUndefined();
      }
    });

    it('cached courses + refresh successful => success with isRefreshing: false', () => {
      const status: RefreshStatus = { state: 'success' };
      const state = reduceDashboardState(sampleCourses, status);

      expect(state.kind).toBe('success');
      if (state.kind === 'success') {
        expect(state.courses).toEqual(sampleCourses);
        expect(state.isRefreshing).toBe(false);
        expect(state.offlineMessage).toBeUndefined();
      }
    });
  });

  describe('When cache is empty (courses.length === 0)', () => {
    it('empty cache + refresh failure => error state with message', () => {
      const status: RefreshStatus = {
        state: 'error',
        message: 'Unable to connect to server',
      };
      const state = reduceDashboardState([], status);

      expect(state).toEqual({
        kind: 'error',
        message: 'Unable to connect to server',
      });
    });

    it('empty cache + refresh success with no data => empty state', () => {
      const status: RefreshStatus = { state: 'success' };
      const state = reduceDashboardState([], status);

      expect(state).toEqual({ kind: 'empty' });
    });

    it('empty cache + refreshing => loading state', () => {
      const status: RefreshStatus = { state: 'refreshing' };
      const state = reduceDashboardState([], status);

      expect(state).toEqual({ kind: 'loading' });
    });
  });
});

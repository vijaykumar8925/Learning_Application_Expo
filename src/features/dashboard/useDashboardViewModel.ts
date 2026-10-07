import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { devConfig, FakeApiMode } from '../../core/config';
import { useContainer } from '../../core/container';
import { toUserMessage } from '../../core/errors';
import { Course } from '../../domain/models';
import {
  DashboardUiState,
  reduceDashboardState,
  RefreshStatus,
} from './dashboardReducer';

export function useDashboardViewModel() {
  const { courseRepository, authRepository } = useContainer();

  const [courses, setCourses] = useState<readonly Course[] | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({ state: 'refreshing' });
  const [devApiMode, setDevApiModeState] = useState<FakeApiMode>(
    devConfig.getFakeApiMode(),
  );

  const isMountedRef = useRef(true);
  const isRefreshingRef = useRef(false);

  // Subscribe to dev config changes
  useEffect(() => {
    return devConfig.subscribe((mode) => {
      if (isMountedRef.current) {
        setDevApiModeState(mode);
      }
    });
  }, []);

  // Perform refresh with network error fallback
  const refresh = useCallback(async (): Promise<void> => {
    if (isRefreshingRef.current) {
      return; // Guard against concurrent refreshes
    }

    isRefreshingRef.current = true;
    if (isMountedRef.current) {
      setRefreshStatus({ state: 'refreshing' });
    }

    try {
      await courseRepository.refreshCourses();
      if (isMountedRef.current) {
        setRefreshStatus({ state: 'success' });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setRefreshStatus({
          state: 'error',
          message: toUserMessage(err),
        });
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [courseRepository]);

  // Subscribe to SQLite single source of truth on mount
  useEffect(() => {
    isMountedRef.current = true;

    // Observe SQLite database directly
    const unsubscribe = courseRepository.observeCourses((updatedCourses) => {
      if (isMountedRef.current) {
        setCourses(updatedCourses);
      }
    });

    // Run initial asynchronous refresh without synchronous setState in effect body
    isRefreshingRef.current = true;
    courseRepository
      .refreshCourses()
      .then(() => {
        if (isMountedRef.current) {
          setRefreshStatus({ state: 'success' });
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          setRefreshStatus({
            state: 'error',
            message: toUserMessage(err),
          });
        }
      })
      .finally(() => {
        isRefreshingRef.current = false;
      });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [courseRepository]);

  const setDevApiMode = useCallback((mode: FakeApiMode) => {
    devConfig.setFakeApiMode(mode);
  }, []);

  const logout = useCallback(async (onLoggedOut: () => void): Promise<void> => {
    await authRepository.logout();
    onLoggedOut();
  }, [authRepository]);

  const uiState: DashboardUiState = useMemo(() => {
    return reduceDashboardState(courses, refreshStatus);
  }, [courses, refreshStatus]);

  return {
    uiState,
    refresh,
    logout,
    devApiMode,
    setDevApiMode,
  };
}

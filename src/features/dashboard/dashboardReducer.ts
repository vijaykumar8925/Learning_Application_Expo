import { Course } from '../../domain/models';

export type RefreshStatus =
  | { readonly state: 'idle' }
  | { readonly state: 'refreshing' }
  | { readonly state: 'success' }
  | { readonly state: 'error'; readonly message: string };

export type DashboardUiState =
  | { readonly kind: 'loading' }
  | {
      readonly kind: 'success';
      readonly courses: readonly Course[];
      readonly isRefreshing: boolean;
      readonly offlineMessage?: string;
    }
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Pure reducer function to determine Dashboard UI state.
 *
 * Rules:
 * - If DB has data: Always render 'success'. If refresh failed, attach offlineMessage.
 * - If DB is empty:
 *     - If refreshing: render 'loading'.
 *     - If refresh failed: render 'error' with message.
 *     - If refresh succeeded with 0 courses: render 'empty'.
 *     - If idle (initial load): render 'loading'.
 */
export function reduceDashboardState(
  courses: readonly Course[] | null,
  refreshStatus: RefreshStatus,
): DashboardUiState {
  // Database has not returned initial snapshot yet
  if (courses === null) {
    return { kind: 'loading' };
  }

  // SQLite cache has data: single source of truth always serves cached content
  if (courses.length > 0) {
    if (refreshStatus.state === 'error') {
      return {
        kind: 'success',
        courses,
        isRefreshing: false,
        offlineMessage: `Offline – showing saved data (${refreshStatus.message})`,
      };
    }

    return {
      kind: 'success',
      courses,
      isRefreshing: refreshStatus.state === 'refreshing',
    };
  }

  // SQLite cache is empty
  switch (refreshStatus.state) {
    case 'refreshing':
    case 'idle':
      return { kind: 'loading' };
    case 'error':
      return { kind: 'error', message: refreshStatus.message };
    case 'success':
      return { kind: 'empty' };
  }
}

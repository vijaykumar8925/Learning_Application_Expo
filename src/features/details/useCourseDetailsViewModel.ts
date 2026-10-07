import { useCallback, useEffect, useRef, useState } from 'react';
import { useContainer } from '../../core/container';
import { CourseDetail } from '../../domain/models';

export type DetailsUiState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'success'; readonly course: CourseDetail }
  | { readonly kind: 'notFound' };

export function useCourseDetailsViewModel(courseId: number) {
  const { courseRepository } = useContainer();
  const isInvalidId = isNaN(courseId) || courseId <= 0;

  const [uiState, setUiState] = useState<DetailsUiState>(() =>
    isInvalidId ? { kind: 'notFound' } : { kind: 'loading' },
  );
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (isInvalidId) {
      return;
    }

    // Subscribe to SQLite database for this course detail
    const unsubscribe = courseRepository.observeCourseDetail(
      courseId,
      (detail) => {
        if (!isMountedRef.current) return;

        if (detail) {
          setUiState({ kind: 'success', course: detail });
        } else {
          setUiState({ kind: 'notFound' });
        }
      },
    );

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [courseId, courseRepository, isInvalidId]);

  // Direct SQLite mutation: Single source of truth updates and notifies subscribers
  const markLessonCompleted = useCallback(
    async (lessonId: number): Promise<void> => {
      try {
        await courseRepository.completeLesson(lessonId);
      } catch (e) {
        console.error('Failed to complete lesson:', e);
      }
    },
    [courseRepository],
  );

  return {
    uiState,
    markLessonCompleted,
  };
}

import { Course, CourseDetail, LoginCredentials, User } from './models';

export type Unsubscribe = () => void;

export interface CourseRepository {
  /**
   * Observe the reactive list of courses from the local SQLite database.
   * Subscriber is invoked immediately with the current cache snapshot,
   * and subsequently whenever writes occur.
   */
  observeCourses(listener: (courses: readonly Course[]) => void): Unsubscribe;

  /**
   * Observe a single course detail (including lessons) reactively.
   */
  observeCourseDetail(id: number, listener: (course: CourseDetail | null) => void): Unsubscribe;

  /**
   * Refresh the local database from the remote data source.
   * Follows the refresh merge rules to preserve local user progress.
   */
  refreshCourses(): Promise<void>;

  /**
   * Mark a lesson as completed directly in the local database.
   * Notifies subscribers to trigger reactive UI updates.
   */
  completeLesson(lessonId: number): Promise<void>;

  /**
   * One-shot fetch for a course detail if needed.
   */
  getCourseDetail(id: number): Promise<CourseDetail | null>;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  getToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
}

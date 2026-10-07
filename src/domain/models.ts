/**
 * Domain Models
 * Pure data representations agnostic of database tables or remote JSON payloads.
 */

export interface Course {
  readonly id: number;
  readonly title: string;
  readonly instructor: string;
  readonly progress: number; // Derived 0..100
  readonly lessonCount: number;
  readonly completedCount: number;
}

export interface Lesson {
  readonly id: number;
  readonly courseId: number;
  readonly title: string;
  readonly position: number;
  readonly isCompleted: boolean;
}

export interface CourseDetail extends Course {
  readonly lessons: readonly Lesson[];
}

export interface User {
  readonly email: string;
  readonly token: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

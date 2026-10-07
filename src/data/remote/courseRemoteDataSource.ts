export interface RemoteCoursePayload {
  readonly id: number;
  readonly title: string;
  readonly instructor: string;
  readonly progress: number;
  readonly lessons: number;
}

export interface RemoteLessonPayload {
  readonly id: number;
  readonly courseId: number;
  readonly title: string;
  readonly position: number;
  readonly isCompleted: boolean;
}

export interface RemoteDataPayload {
  readonly courses: readonly RemoteCoursePayload[];
  readonly lessons: readonly RemoteLessonPayload[];
}

export interface CourseRemoteDataSource {
  /**
   * Fetches latest remote courses and their generated lessons.
   * Throws NetworkError on network/simulated failure.
   */
  fetchCoursesAndLessons(): Promise<RemoteDataPayload>;
}

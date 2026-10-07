import { Clock, defaultClock, devConfig } from '../../core/config';
import { NetworkError } from '../../core/errors';
import rawCourses from './assets/courses.json';
import rawLessons from './assets/lessons.json';
import {
  CourseRemoteDataSource,
  RemoteCoursePayload,
  RemoteDataPayload,
  RemoteLessonPayload,
} from './courseRemoteDataSource';

const typedLessonsMap: Record<string, string[]> = rawLessons as Record<string, string[]>;
const typedCourses: RemoteCoursePayload[] = rawCourses as RemoteCoursePayload[];

export class FakeCourseRemoteDataSource implements CourseRemoteDataSource {
  constructor(
    private readonly clock: Clock = defaultClock,
    private readonly simulatedDelayMs: number = 800,
  ) {}

  async fetchCoursesAndLessons(): Promise<RemoteDataPayload> {
    await this.clock.delay(this.simulatedDelayMs);

    const mode = devConfig.getFakeApiMode();

    if (mode === 'FAILURE') {
      throw new NetworkError('Unable to connect to the learning server. Check connection.');
    }

    if (mode === 'EMPTY') {
      return {
        courses: [],
        lessons: [],
      };
    }

    // SUCCESS Mode: Build lessons for each course
    const generatedLessons: RemoteLessonPayload[] = [];

    for (const course of typedCourses) {
      const titles = typedLessonsMap[String(course.id)] || [];
      const completedThreshold = Math.round((course.progress / 100) * course.lessons);

      for (let position = 1; position <= course.lessons; position++) {
        // Deterministic unique ID across courses: courseId * 1000 + position
        const lessonId = course.id * 1000 + position;
        const title = titles[position - 1] ?? `Lesson ${position}`;
        const isCompleted = position <= completedThreshold;

        generatedLessons.push({
          id: lessonId,
          courseId: course.id,
          title,
          position,
          isCompleted,
        });
      }
    }

    return {
      courses: typedCourses,
      lessons: generatedLessons,
    };
  }
}

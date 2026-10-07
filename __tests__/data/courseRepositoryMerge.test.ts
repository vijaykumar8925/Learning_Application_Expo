import { SqliteCourseLocalDataSource } from '../../src/data/local/courseLocalDataSource';
import {
  RemoteCoursePayload,
  RemoteLessonPayload,
} from '../../src/data/remote/courseRemoteDataSource';

interface StoredCourse {
  id: number;
  title: string;
  instructor: string;
}

interface StoredLesson {
  id: number;
  courseId: number;
  title: string;
  position: number;
  isCompleted: number;
}

describe('Refresh Merge Rule: Preservation of locally completed lessons', () => {
  let coursesStore: Map<number, StoredCourse>;
  let lessonsStore: Map<number, StoredLesson>;
  let localDataSource: SqliteCourseLocalDataSource;

  beforeEach(() => {
    coursesStore = new Map();
    lessonsStore = new Map();

    // Mock SQLite database implementing the exact SQLite methods used by SqliteCourseLocalDataSource
    const mockDb: any = {
      withTransactionAsync: async (callback: () => Promise<void>) => {
        await callback();
      },
      getAllAsync: async (sql: string, params: any[] = []) => {
        if (sql.includes('SELECT id FROM lessons WHERE is_completed = 1')) {
          const completed: { id: number }[] = [];
          for (const l of lessonsStore.values()) {
            if (l.isCompleted === 1) {
              completed.push({ id: l.id });
            }
          }
          return completed;
        }
        if (sql.includes('FROM courses c LEFT JOIN lessons l')) {
          const results: any[] = [];
          for (const c of coursesStore.values()) {
            const courseLessons = Array.from(lessonsStore.values()).filter(
              (l) => l.courseId === c.id,
            );
            const completedCount = courseLessons.filter((l) => l.isCompleted === 1).length;
            results.push({
              id: c.id,
              title: c.title,
              instructor: c.instructor,
              lessonCount: courseLessons.length,
              completedCount,
            });
          }
          return results;
        }
        return [];
      },
      runAsync: async (sql: string, params: any[] = []) => {
        if (sql.includes('INSERT INTO courses')) {
          const [id, title, instructor] = params;
          coursesStore.set(id, { id, title, instructor });
        } else if (sql.includes('INSERT INTO lessons')) {
          const [id, courseId, title, position, isCompleted] = params;
          lessonsStore.set(id, { id, courseId, title, position, isCompleted });
        } else if (sql.includes('DELETE FROM courses WHERE id NOT IN')) {
          const keepIds = new Set(params);
          for (const id of coursesStore.keys()) {
            if (!keepIds.has(id)) {
              coursesStore.delete(id);
            }
          }
        } else if (sql.includes('DELETE FROM lessons WHERE id NOT IN')) {
          const keepIds = new Set(params);
          for (const id of lessonsStore.keys()) {
            if (!keepIds.has(id)) {
              lessonsStore.delete(id);
            }
          }
        }
      },
    };

    localDataSource = new SqliteCourseLocalDataSource(async () => mockDb);
  });

  it('preserves locally completed lessons when remote refresh brings isCompleted=false', async () => {
    // 1. Initial State: Course 1 with Lesson 1001 (completed locally) and Lesson 1002 (pending)
    coursesStore.set(1, {
      id: 1,
      title: 'Python Programming',
      instructor: 'John Smith',
    });
    lessonsStore.set(1001, {
      id: 1001,
      courseId: 1,
      title: 'Intro',
      position: 1,
      isCompleted: 1, // User marked this complete locally
    });
    lessonsStore.set(1002, {
      id: 1002,
      courseId: 1,
      title: 'Variables',
      position: 2,
      isCompleted: 0,
    });

    // 2. Incoming remote payload: Server says lesson 1001 is NOT completed (isCompleted: false)
    const remoteCourses: RemoteCoursePayload[] = [
      {
        id: 1,
        title: 'Python Programming (Updated)',
        instructor: 'John Smith',
        progress: 0,
        lessons: 2,
      },
    ];
    const remoteLessons: RemoteLessonPayload[] = [
      {
        id: 1001,
        courseId: 1,
        title: 'Intro to Python (New Title)',
        position: 1,
        isCompleted: false, // Server says false
      },
      {
        id: 1002,
        courseId: 1,
        title: 'Variables',
        position: 2,
        isCompleted: false,
      },
    ];

    // 3. Execute atomic merge
    await localDataSource.mergeCoursesAndLessons(remoteCourses, remoteLessons);

    // 4. Verify lesson 1001 retained its locally completed status (1), and updated its title
    const lesson1 = lessonsStore.get(1001);
    expect(lesson1).toBeDefined();
    expect(lesson1?.isCompleted).toBe(1); // Crucial: NOT overwritten with 0!
    expect(lesson1?.title).toBe('Intro to Python (New Title)');

    // Verify course title updated
    const course = coursesStore.get(1);
    expect(course?.title).toBe('Python Programming (Updated)');
  });

  it('prunes deleted courses and deleted lessons when remote removes them', async () => {
    // Old courses 1 and 2
    coursesStore.set(1, { id: 1, title: 'Course 1', instructor: 'Inst 1' });
    coursesStore.set(2, { id: 2, title: 'Course 2', instructor: 'Inst 2' });
    lessonsStore.set(101, { id: 101, courseId: 1, title: 'L1', position: 1, isCompleted: 1 });
    lessonsStore.set(201, { id: 201, courseId: 2, title: 'L2', position: 1, isCompleted: 0 });

    // Remote returns only Course 1
    const remoteCourses: RemoteCoursePayload[] = [
      { id: 1, title: 'Course 1', instructor: 'Inst 1', progress: 50, lessons: 1 },
    ];
    const remoteLessons: RemoteLessonPayload[] = [
      { id: 101, courseId: 1, title: 'L1', position: 1, isCompleted: false },
    ];

    await localDataSource.mergeCoursesAndLessons(remoteCourses, remoteLessons);

    expect(coursesStore.has(1)).toBe(true);
    expect(coursesStore.has(2)).toBe(false); // Course 2 removed
    expect(lessonsStore.has(101)).toBe(true);
    expect(lessonsStore.has(201)).toBe(false); // Lesson 201 removed
  });
});

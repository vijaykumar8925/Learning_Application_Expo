import { calculateProgress } from '../../domain/progress';
import { Course, CourseDetail, Lesson } from '../../domain/models';
import {
  RemoteCoursePayload,
  RemoteLessonPayload,
} from '../remote/courseRemoteDataSource';
import { getDatabase } from './db';
import * as SQLite from 'expo-sqlite';

export interface CourseLocalDataSource {
  getAllCourses(): Promise<Course[]>;
  getCourseDetail(id: number): Promise<CourseDetail | null>;
  setLessonCompleted(lessonId: number, isCompleted: boolean): Promise<void>;
  mergeCoursesAndLessons(
    remoteCourses: readonly RemoteCoursePayload[],
    remoteLessons: readonly RemoteLessonPayload[],
  ): Promise<void>;
}

interface CourseDbRow {
  id: number;
  title: string;
  instructor: string;
  lessonCount: number;
  completedCount: number | null;
}

interface LessonDbRow {
  id: number;
  courseId: number;
  title: string;
  position: number;
  isCompleted: number;
}

export class SqliteCourseLocalDataSource implements CourseLocalDataSource {
  constructor(private readonly getDb: () => Promise<SQLite.SQLiteDatabase> = getDatabase) {}

  async getAllCourses(): Promise<Course[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<CourseDbRow>(`
      SELECT 
        c.id, 
        c.title, 
        c.instructor, 
        COUNT(l.id) AS lessonCount, 
        SUM(CASE WHEN l.is_completed = 1 THEN 1 ELSE 0 END) AS completedCount
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      GROUP BY c.id, c.title, c.instructor
      ORDER BY c.id ASC;
    `);

    return rows.map((row) => {
      const completedCount = row.completedCount ?? 0;
      const lessonCount = row.lessonCount ?? 0;
      return {
        id: row.id,
        title: row.title,
        instructor: row.instructor,
        lessonCount,
        completedCount,
        progress: calculateProgress(completedCount, lessonCount),
      };
    });
  }

  async getCourseDetail(id: number): Promise<CourseDetail | null> {
    const db = await this.getDb();
    const courseRow = await db.getFirstAsync<CourseDbRow>(
      `
      SELECT 
        c.id, 
        c.title, 
        c.instructor, 
        COUNT(l.id) AS lessonCount, 
        SUM(CASE WHEN l.is_completed = 1 THEN 1 ELSE 0 END) AS completedCount
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.id = ?
      GROUP BY c.id, c.title, c.instructor;
      `,
      [id],
    );

    if (!courseRow) {
      return null;
    }

    const lessonRows = await db.getAllAsync<LessonDbRow>(
      `
      SELECT 
        id, 
        course_id AS courseId, 
        title, 
        position, 
        is_completed AS isCompleted
      FROM lessons
      WHERE course_id = ?
      ORDER BY position ASC;
      `,
      [id],
    );

    const lessons: Lesson[] = lessonRows.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      position: l.position,
      isCompleted: l.isCompleted === 1,
    }));

    const completedCount = courseRow.completedCount ?? 0;
    const lessonCount = courseRow.lessonCount ?? 0;

    return {
      id: courseRow.id,
      title: courseRow.title,
      instructor: courseRow.instructor,
      lessonCount,
      completedCount,
      progress: calculateProgress(completedCount, lessonCount),
      lessons,
    };
  }

  async setLessonCompleted(lessonId: number, isCompleted: boolean): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE lessons SET is_completed = ? WHERE id = ?;`,
      [isCompleted ? 1 : 0, lessonId],
    );
  }

  /**
   * CRITICAL REFRESH MERGE RULE:
   * Performed in a single atomic SQLite transaction:
   * 1. Query existing locally completed lesson IDs.
   * 2. Upsert courses with INSERT ... ON CONFLICT(id) DO UPDATE.
   *    (Avoids INSERT OR REPLACE which triggers CASCADE DELETE on child lessons).
   * 3. Prune courses that are no longer returned by the remote source.
   * 4. Upsert lessons preserving local completion state: is_completed = remote OR local.
   * 5. Prune removed lessons.
   */
  async mergeCoursesAndLessons(
    remoteCourses: readonly RemoteCoursePayload[],
    remoteLessons: readonly RemoteLessonPayload[],
  ): Promise<void> {
    const db = await this.getDb();

    await db.withTransactionAsync(async () => {
      // Step 1: Read all currently completed lesson IDs in the local DB
      const completedRows = await db.getAllAsync<{ id: number }>(
        `SELECT id FROM lessons WHERE is_completed = 1;`,
      );
      const localCompletedSet = new Set<number>(completedRows.map((r) => r.id));

      // Step 2: Upsert incoming courses
      for (const course of remoteCourses) {
        await db.runAsync(
          `
          INSERT INTO courses (id, title, instructor)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            instructor = excluded.instructor;
          `,
          [course.id, course.title, course.instructor],
        );
      }

      // Step 3: Remove courses not present in remote payload
      if (remoteCourses.length === 0) {
        await db.runAsync(`DELETE FROM courses;`);
      } else {
        const coursePlaceholders = remoteCourses.map(() => '?').join(',');
        const courseIds = remoteCourses.map((c) => c.id);
        await db.runAsync(
          `DELETE FROM courses WHERE id NOT IN (${coursePlaceholders});`,
          courseIds,
        );
      }

      // Step 4: Upsert incoming lessons, preserving local completions
      for (const lesson of remoteLessons) {
        const isLocallyCompleted = localCompletedSet.has(lesson.id);
        const finalCompleted = isLocallyCompleted || lesson.isCompleted ? 1 : 0;

        await db.runAsync(
          `
          INSERT INTO lessons (id, course_id, title, position, is_completed)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            course_id = excluded.course_id,
            title = excluded.title,
            position = excluded.position,
            is_completed = excluded.is_completed;
          `,
          [lesson.id, lesson.courseId, lesson.title, lesson.position, finalCompleted],
        );
      }

      // Step 5: Prune lessons no longer in remote payload
      if (remoteLessons.length === 0) {
        await db.runAsync(`DELETE FROM lessons;`);
      } else {
        const lessonPlaceholders = remoteLessons.map(() => '?').join(',');
        const lessonIds = remoteLessons.map((l) => l.id);
        await db.runAsync(
          `DELETE FROM lessons WHERE id NOT IN (${lessonPlaceholders});`,
          lessonIds,
        );
      }
    });
  }
}

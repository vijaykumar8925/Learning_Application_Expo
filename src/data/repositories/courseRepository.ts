import { Course, CourseDetail } from '../../domain/models';
import { CourseRepository, Unsubscribe } from '../../domain/repositories';
import { CourseLocalDataSource } from '../local/courseLocalDataSource';
import { CourseRemoteDataSource } from '../remote/courseRemoteDataSource';

export class AppCourseRepository implements CourseRepository {
  private courseListSubscribers: Set<(courses: readonly Course[]) => void> = new Set();
  private courseDetailSubscribers: Map<
    number,
    Set<(course: CourseDetail | null) => void>
  > = new Map();

  // Monotonic sequence counters to drop stale out-of-order queries
  private listQuerySequence = 0;
  private detailQuerySequences: Map<number, number> = new Map();

  constructor(
    private readonly localDataSource: CourseLocalDataSource,
    private readonly remoteDataSource: CourseRemoteDataSource,
  ) {}

  observeCourses(listener: (courses: readonly Course[]) => void): Unsubscribe {
    this.courseListSubscribers.add(listener);

    // Initial query for this subscriber
    this.notifySingleListSubscriber(listener);

    return () => {
      this.courseListSubscribers.delete(listener);
    };
  }

  observeCourseDetail(
    id: number,
    listener: (course: CourseDetail | null) => void,
  ): Unsubscribe {
    let detailSet = this.courseDetailSubscribers.get(id);
    if (!detailSet) {
      detailSet = new Set();
      this.courseDetailSubscribers.set(id, detailSet);
    }
    detailSet.add(listener);

    // Initial query for this subscriber
    this.notifySingleDetailSubscriber(id, listener);

    return () => {
      const currentSet = this.courseDetailSubscribers.get(id);
      if (currentSet) {
        currentSet.delete(listener);
        if (currentSet.size === 0) {
          this.courseDetailSubscribers.delete(id);
          this.detailQuerySequences.delete(id);
        }
      }
    };
  }

  async refreshCourses(): Promise<void> {
    // 1. Fetch remote data (will throw typed NetworkError if network fails or dev mode is FAILURE)
    const remoteData = await this.remoteDataSource.fetchCoursesAndLessons();

    // 2. Atomically merge remote into SQLite, preserving local completions
    await this.localDataSource.mergeCoursesAndLessons(
      remoteData.courses,
      remoteData.lessons,
    );

    // 3. Notify all subscribers to re-query the single source of truth
    await this.notifyAllSubscribers();
  }

  async completeLesson(lessonId: number): Promise<void> {
    // 1. Update SQLite
    await this.localDataSource.setLessonCompleted(lessonId, true);

    // 2. Notify all subscribers immediately
    await this.notifyAllSubscribers();
  }

  async getCourseDetail(id: number): Promise<CourseDetail | null> {
    return await this.localDataSource.getCourseDetail(id);
  }

  private async notifyAllSubscribers(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.courseListSubscribers.size > 0) {
      promises.push(this.broadcastCourses());
    }

    for (const id of this.courseDetailSubscribers.keys()) {
      promises.push(this.broadcastCourseDetail(id));
    }

    await Promise.all(promises);
  }

  private async broadcastCourses(): Promise<void> {
    const seq = ++this.listQuerySequence;
    try {
      const courses = await this.localDataSource.getAllCourses();
      if (seq === this.listQuerySequence) {
        this.courseListSubscribers.forEach((listener) => {
          try {
            listener(courses);
          } catch (e) {
            console.error('Error in course list listener:', e);
          }
        });
      }
    } catch (e) {
      console.error('Failed to query courses from SQLite:', e);
    }
  }

  private async notifySingleListSubscriber(
    listener: (courses: readonly Course[]) => void,
  ): Promise<void> {
    try {
      const courses = await this.localDataSource.getAllCourses();
      listener(courses);
    } catch (e) {
      console.error('Failed to notify single list subscriber:', e);
    }
  }

  private async broadcastCourseDetail(id: number): Promise<void> {
    const currentSeq = (this.detailQuerySequences.get(id) ?? 0) + 1;
    this.detailQuerySequences.set(id, currentSeq);

    try {
      const detail = await this.localDataSource.getCourseDetail(id);
      if (this.detailQuerySequences.get(id) === currentSeq) {
        const subscribers = this.courseDetailSubscribers.get(id);
        if (subscribers) {
          subscribers.forEach((listener) => {
            try {
              listener(detail);
            } catch (e) {
              console.error('Error in course detail listener:', e);
            }
          });
        }
      }
    } catch (e) {
      console.error(`Failed to query course detail ${id} from SQLite:`, e);
    }
  }

  private async notifySingleDetailSubscriber(
    id: number,
    listener: (course: CourseDetail | null) => void,
  ): Promise<void> {
    try {
      const detail = await this.localDataSource.getCourseDetail(id);
      listener(detail);
    } catch (e) {
      console.error(`Failed to notify single detail subscriber for ${id}:`, e);
    }
  }
}

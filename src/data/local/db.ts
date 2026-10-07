import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'learning_dashboard.db';
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initializes and migrates the SQLite database.
 * Foreign keys are enabled on every connection.
 * Version migrations use PRAGMA user_version.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Foreign key constraint enforcement must be enabled per database connection
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Read current schema version
      const versionResult = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version;',
      );
      const currentVersion = versionResult?.user_version ?? 0;

      if (currentVersion < SCHEMA_VERSION) {
        await db.withTransactionAsync(async () => {
          if (currentVersion < 1) {
            await db.execAsync(`
              CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                instructor TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                position INTEGER NOT NULL,
                is_completed INTEGER NOT NULL DEFAULT 0
              );

              CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
              PRAGMA user_version = 1;
            `);
          }
        });
      }

      return db;
    })();
  }

  return dbPromise;
}

/**
 * Utility for tests to reset the database connection singleton.
 */
export function resetDatabaseInstance(): void {
  dbPromise = null;
}

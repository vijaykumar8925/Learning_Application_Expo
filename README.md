# Learning Dashboard (React Native + Expo)

Production-grade Learning Dashboard mobile app engineered with Expo (managed workflow, SDK 57), TypeScript strict mode, MVVM + Repository architecture, and SQLite as the offline-first single source of truth.

---

## Quick Start & Demo Credentials

### Prerequisites
- Node.js >= 18, npm >= 9
- Android Studio / Xcode / Expo Go

### Installation & Run
```bash
npm install
npx expo start               # Start Metro bundler (interactive menu)
npm run android              # Run on Android emulator / device
npm run ios                  # Run on iOS simulator
npm test                     # Run Jest test suite (27 unit tests)
npm run typecheck            # Strict TypeScript validation (tsc --noEmit)
npm run lint                 # ESLint checks (0 errors, 0 warnings)
```

### Demo Credentials
- **Email:** `demo@learning.com`
- **Password:** `password123`
*(A quick auto-fill button is provided directly on the Login screen).*

---

## 1. Architecture

```
UI Layer (Screens / Memoized Components)
   │
   ▼
ViewModel Hooks (Typed UiState + Actions)
   │
   ▼
Domain Layer (Models, Repository Interfaces, Pure Business Logic)
   │
   ▼
Data Layer (Repositories: CourseRepository, AuthRepository)
   ├── LocalDataSource: SQLite (Single Source of Truth)
   └── RemoteDataSource: FakeCourseRemoteDataSource (Swappable REST/GraphQL)
```

- **ViewModel Hooks (`use<Name>ViewModel`):** Encapsulate feature state machines and business logic away from presentation components. Screens simply render typed `UiState` unions.
- **Repository Pattern:** Abstracts local cache and network fetching behind uniform domain interfaces. Repositories can be mocked in unit tests without touching disk or network.
- **SQLite as Single Source of Truth:** The UI *never* renders directly from network responses. The network solely reconciles SQLite; the UI observes SQLite reactively via subscription listeners.
- **Dependency Injection:** Lightweight container (`src/core/container.tsx`) allows swapping real SQLite and SecureStore instances for in-memory mocks during unit testing.

---

## 2. Offline Support & Data Model

### Relational Schema (`expo-sqlite` Modern Async API)
- `courses(id INTEGER PRIMARY KEY, title TEXT, instructor TEXT)`
- `lessons(id INTEGER PRIMARY KEY, course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, title TEXT, position INTEGER, is_completed INTEGER DEFAULT 0)` with index `idx_lessons_course_id`.
- `PRAGMA foreign_keys = ON;` and versioned migrations via `PRAGMA user_version`.
- **Derived Progress:** Progress is never stored as a mutable column. It is computed dynamically via SQL `LEFT JOIN + GROUP BY` and domain `calculateProgress(completed, total)`. *(Note: 40% of 16 lessons is 6.4 => rounds to 6 = 38%).*

### Atomic Refresh Merge Rule (`withTransactionAsync`)
When refreshing from remote:
1. Query locally completed lesson IDs: `SELECT id FROM lessons WHERE is_completed = 1`.
2. Upsert courses with `INSERT ... ON CONFLICT(id) DO UPDATE` (not `INSERT OR REPLACE`, which would delete rows and cascade-delete child lessons).
3. Prune courses no longer returned by the server.
4. Upsert lessons with `is_completed = remote.completed OR locally_completed`.
5. Prune deleted lessons.
6. **Fallback Banner:** When offline or in simulated `FAILURE` mode, previously cached courses and user-completed lessons remain fully functional, accompanied by an `Offline – showing saved data` notice.

---

## 3. Production Security

- **Secure Token Storage:** Tokens are stored in hardware-backed storage (`expo-secure-store`), backed by iOS Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`) and Android Keystore (EncryptedSharedPreferences). Never stored in plaintext `AsyncStorage`.
- **Token Rotation:** Production architecture requires short-lived JWT access tokens (e.g., 15 mins) paired with rotating refresh tokens stored securely.
- **Logout Invalidation:** Logout immediately purges local Keystore tokens and triggers server-side refresh token revocation.
- **Device Protection:** Disable Android auto-backup for sensitive storage (`android:allowBackup="false"` in Manifest) and enforce TLS Certificate Pinning via custom development builds (`expo-build-properties` / OkHttp network security config).

---

## 4. Scaling to 1M Users & 1,000+ Courses

1. **Windowed Lists (`@shopify/flash-list`):** Replace standard FlatList with FlashList to recycle native views, achieving 60/120 FPS across thousands of course items with minimal memory footprint.
2. **Cursor-Based Pagination & Server-Side Search:** Paginate course feeds (`limit=20&cursor=XYZ`) and store results in an indexed SQLite full-text search table (`FTS5`).
3. **Delta Sync & Conditional Requests:** Transmit `If-None-Match` (ETag) or `updated_after` timestamps so clients only download modified course deltas instead of full payloads.
4. **Offline Mutation Queue:** Queue local lesson completions in a SQLite `outbox` table and synchronize via an exponential-backoff background task (`expo-background-fetch`).
5. **Observability & Remote Flags:** Integrate Sentry for crash/ANR reporting, OpenTelemetry for network tracing, and LaunchDarkly for dynamic feature flags.

---

## 5. Multi-Platform Mapping (React Native vs Native)

| Concern | React Native + Expo | Native Android | Native iOS |
| :--- | :--- | :--- | :--- |
| **UI** | JSX + StyleSheet | Jetpack Compose | SwiftUI |
| **State / VM** | Custom React Hook | `androidx.lifecycle.ViewModel` | `@Observable` / `@StateObject` |
| **Local DB** | `expo-sqlite` (Async API) | Room Database | SwiftData / CoreData |
| **Key Storage** | `expo-secure-store` | Android Keystore / EncryptedSharedPreferences | iOS Keychain Services |
| **Reactive DB** | Observer / `useSyncExternalStore` | `StateFlow` / `Flow` | `@Query` / Combine Publisher |

### React Native Trade-Offs
- **Benefits:** Single codebase for iOS, Android, and Web; rapid iteration via Fast Refresh; shared business logic and TypeScript type safety.
- **Costs:** Bridge/JSI overhead for high-frequency operations; dependency on native module bridges; major React Native/Expo SDK upgrade cycles.

---

## Trade-offs & Next Steps
- **Internationalization (i18n):** User-facing strings currently live in component/theme definitions; next step is centralizing under `react-i18next`.
- **Biometric Auth:** Add `expo-local-authentication` for Face ID / Fingerprint unlock.
- **Audio/Video Playback:** Integrate `expo-video` for course media streaming.

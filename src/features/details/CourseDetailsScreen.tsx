import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, shadows, spacing, typography } from '../../core/theme';
import { Lesson } from '../../domain/models';
import { LessonRow } from './components/LessonRow';
import { useCourseDetailsViewModel } from './useCourseDetailsViewModel';

interface CourseDetailsScreenProps {
  courseId: number;
}

export const CourseDetailsScreen: React.FC<CourseDetailsScreenProps> = ({ courseId }) => {
  const router = useRouter();
  const { uiState, markLessonCompleted } = useCourseDetailsViewModel(courseId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderLessonItem: ListRenderItem<Lesson> = useCallback(
    ({ item }) => <LessonRow lesson={item} onComplete={markLessonCompleted} />,
    [markLessonCompleted],
  );

  const keyExtractor = useCallback((item: Lesson) => item.id.toString(), []);

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back to courses dashboard"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* State Rendering */}
      {uiState.kind === 'loading' && (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      )}

      {uiState.kind === 'notFound' && (
        <View style={styles.centeredContainer}>
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>🔍</Text>
            <Text style={styles.stateTitle}>Course Not Found</Text>
            <Text style={styles.stateMessage}>
              We couldn&apos;t find this course in your local database.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {uiState.kind === 'success' && (
        <FlatList
          data={uiState.course.lessons}
          renderItem={renderLessonItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.courseHeaderCard}>
              <Text style={styles.courseTitle}>{uiState.course.title}</Text>
              <Text style={styles.courseInstructor}>
                Instructor: {uiState.course.instructor}
              </Text>

              {/* Progress Summary */}
              <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressPercentage}>
                    {uiState.course.progress}%
                  </Text>
                  <Text style={styles.progressCount}>
                    {uiState.course.completedCount}/{uiState.course.lessonCount} lessons
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${uiState.course.progress}%` },
                      uiState.course.progress === 100 && styles.progressFillCompleted,
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Course Syllabus & Lessons</Text>
              <Text style={styles.sectionSubtitle}>
                Tap any pending lesson to mark it completed. Your progress will update instantly.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    ...typography.md,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    ...typography.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 48,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  stateCard: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: radii.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stateIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  stateTitle: {
    ...typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stateMessage: {
    ...typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.md,
  },
  actionButtonText: {
    ...typography.md,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  courseHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  courseTitle: {
    ...typography.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  courseInstructor: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  progressCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  progressPercentage: {
    ...typography.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  progressCount: {
    ...typography.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.progressTrack,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progressFill,
    borderRadius: radii.full,
  },
  progressFillCompleted: {
    backgroundColor: colors.progressCompleted,
  },
  sectionTitle: {
    ...typography.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.xs,
    color: colors.textSecondary,
  },
});

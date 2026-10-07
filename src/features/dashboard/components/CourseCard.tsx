import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../../../core/theme';
import { Course } from '../../../domain/models';

interface CourseCardProps {
  course: Course;
  onPressContinue: (courseId: number) => void;
}

export const CourseCard = memo<CourseCardProps>(({ course, onPressContinue }) => {
  const handlePress = () => {
    onPressContinue(course.id);
  };

  const isCompleted = course.progress === 100;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.instructor}>by {course.instructor}</Text>
        </View>
        <View
          style={[
            styles.badge,
            isCompleted ? styles.badgeCompleted : styles.badgeProgress,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isCompleted ? styles.badgeTextCompleted : styles.badgeTextProgress,
            ]}
          >
            {course.progress}%
          </Text>
        </View>
      </View>

      {/* Progress Track and Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${course.progress}%` },
              isCompleted ? styles.progressFillCompleted : null,
            ]}
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.lessonCountText}>
            {course.completedCount} of {course.lessonCount} lessons completed
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Continue course ${course.title}`}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
});

CourseCard.displayName = 'CourseCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  instructor: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeProgress: {
    backgroundColor: colors.primaryLight,
  },
  badgeCompleted: {
    backgroundColor: colors.successLight,
  },
  badgeText: {
    ...typography.xs,
    fontWeight: '700',
  },
  badgeTextProgress: {
    color: colors.primary,
  },
  badgeTextCompleted: {
    color: colors.success,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.progressTrack,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progressFill,
    borderRadius: radii.full,
  },
  progressFillCompleted: {
    backgroundColor: colors.progressCompleted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonCountText: {
    ...typography.xs,
    color: colors.textMuted,
  },
  continueButton: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});

import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../core/theme';
import { Lesson } from '../../../domain/models';

interface LessonRowProps {
  lesson: Lesson;
  onComplete: (lessonId: number) => void;
}

export const LessonRow = memo<LessonRowProps>(({ lesson, onComplete }) => {
  const handlePress = () => {
    if (!lesson.isCompleted) {
      onComplete(lesson.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.indexBadge,
            lesson.isCompleted && styles.indexBadgeCompleted,
          ]}
        >
          <Text
            style={[
              styles.indexText,
              lesson.isCompleted && styles.indexTextCompleted,
            ]}
          >
            {lesson.position}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
      </View>

      {lesson.isCompleted ? (
        <View style={styles.completedBadge} accessibilityLabel="Completed">
          <Text style={styles.completedBadgeText}>✓ Completed</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.pendingButton}
          onPress={handlePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Mark lesson ${lesson.position} as completed`}
        >
          <Text style={styles.pendingButtonText}>○ Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

LessonRow.displayName = 'LessonRow';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  indexBadgeCompleted: {
    backgroundColor: colors.successLight,
  },
  indexText: {
    ...typography.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  indexTextCompleted: {
    color: colors.success,
  },
  title: {
    ...typography.sm,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedBadgeText: {
    ...typography.xs,
    fontWeight: '700',
    color: colors.success,
  },
  pendingButton: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pendingButtonText: {
    ...typography.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

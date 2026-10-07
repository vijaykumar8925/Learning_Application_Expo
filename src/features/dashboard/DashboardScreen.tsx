import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography } from '../../core/theme';
import { Course } from '../../domain/models';
import { CourseCard } from './components/CourseCard';
import { DevApiModeMenu } from './components/DevApiModeMenu';
import { OfflineBanner } from './components/OfflineBanner';
import { useDashboardViewModel } from './useDashboardViewModel';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { uiState, refresh, logout, devApiMode, setDevApiMode } =
    useDashboardViewModel();

  const handleNavigateDetail = useCallback(
    (courseId: number) => {
      router.push(`/(app)/course/${courseId}`);
    },
    [router],
  );

  const handleLogout = useCallback(() => {
    logout(() => {
      router.replace('/login');
    });
  }, [logout, router]);

  // Memoized renderItem callback for FlatList performance
  const renderItem: ListRenderItem<Course> = useCallback(
    ({ item }) => (
      <CourseCard course={item} onPressContinue={handleNavigateDetail} />
    ),
    [handleNavigateDetail],
  );

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  return (
    <View style={styles.screen}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Learning Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track your active coursework</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out of application"
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Dev Mode Switcher (Visible in __DEV__ only) */}
        <DevApiModeMenu
          currentMode={devApiMode}
          onSelectMode={setDevApiMode}
          onTriggerRefresh={refresh}
        />

        {/* State Rendering */}
        {uiState.kind === 'loading' && (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your courses...</Text>
          </View>
        )}

        {uiState.kind === 'error' && (
          <View style={styles.centeredContainer}>
            <View style={styles.stateCard}>
              <Text style={styles.stateIcon}>⚠️</Text>
              <Text style={styles.stateTitle}>Unable to load courses</Text>
              <Text style={styles.stateMessage}>{uiState.message}</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={refresh}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {uiState.kind === 'empty' && (
          <View style={styles.centeredContainer}>
            <View style={styles.stateCard}>
              <Text style={styles.stateIcon}>📚</Text>
              <Text style={styles.stateTitle}>No Courses Available</Text>
              <Text style={styles.stateMessage}>
                You do not have any enrolled courses at the moment.
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={refresh}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {uiState.kind === 'success' && (
          <FlatList
            data={uiState.courses}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              uiState.offlineMessage ? (
                <OfflineBanner message={uiState.offlineMessage} />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={uiState.isRefreshing}
                onRefresh={refresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    ...typography.xs,
    fontWeight: '600',
    color: colors.error,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
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
    textAlign: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.md,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FakeApiMode } from '../../../core/config';
import { colors, radii, spacing, typography } from '../../../core/theme';

interface DevApiModeMenuProps {
  currentMode: FakeApiMode;
  onSelectMode: (mode: FakeApiMode) => void;
  onTriggerRefresh: () => void;
}

const MODES: readonly { mode: FakeApiMode; label: string; badgeColor: string }[] = [
  { mode: 'SUCCESS', label: '200 OK', badgeColor: colors.success },
  { mode: 'EMPTY', label: 'Empty (0)', badgeColor: colors.warning },
  { mode: 'FAILURE', label: 'Network Error', badgeColor: colors.error },
];

export const DevApiModeMenu: React.FC<DevApiModeMenuProps> = ({
  currentMode,
  onSelectMode,
  onTriggerRefresh,
}) => {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🛠 DEV: Mock API Simulator</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onTriggerRefresh}
          accessibilityRole="button"
          accessibilityLabel="Test Fetch"
        >
          <Text style={styles.refreshButtonText}>Test Refresh ⟳</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.caption}>
        Select mode to test remote server responses & SQLite cache fallback:
      </Text>
      <View style={styles.buttonRow}>
        {MODES.map((item) => {
          const isSelected = currentMode === item.mode;
          return (
            <TouchableOpacity
              key={item.mode}
              style={[
                styles.modeButton,
                isSelected && {
                  backgroundColor: item.badgeColor,
                  borderColor: item.badgeColor,
                },
              ]}
              onPress={() => onSelectMode(item.mode)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  isSelected && styles.modeButtonTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Dark slate dev box
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.xs,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  refreshButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  refreshButtonText: {
    ...typography.xs,
    color: '#60A5FA',
    fontWeight: '600',
  },
  caption: {
    ...typography.xs,
    color: '#64748B',
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  modeButtonText: {
    ...typography.xs,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

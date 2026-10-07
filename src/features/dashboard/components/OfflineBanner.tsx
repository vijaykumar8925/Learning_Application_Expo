import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../core/theme';

interface OfflineBannerProps {
  message: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ message }) => {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.icon}>📡</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Offline Mode</Text>
        <Text style={styles.subtitle}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A', // Amber 200
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  subtitle: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

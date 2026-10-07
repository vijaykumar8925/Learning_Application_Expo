import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../core/theme';
import { DEMO_CREDENTIALS } from '../../../data/repositories/authRepository';

interface Props {
  onAutoFill: () => void;
  disabled?: boolean;
}

export const DemoCredentialsBanner: React.FC<Props> = ({ onAutoFill, disabled }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Demo Credentials</Text>
        <TouchableOpacity
          onPress={onAutoFill}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Auto-fill demo credentials"
        >
          <Text style={[styles.fillButtonText, disabled && styles.disabledText]}>
            Fill in
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.infoLine}>
        <Text style={styles.label}>Email: </Text>
        <Text style={styles.value}>{DEMO_CREDENTIALS.email}</Text>
      </Text>
      <Text style={styles.infoLine}>
        <Text style={styles.label}>Password: </Text>
        <Text style={styles.value}>{DEMO_CREDENTIALS.password}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  fillButtonText: {
    ...typography.xs,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
  infoLine: {
    ...typography.xs,
    marginTop: 2,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    color: colors.textPrimary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});

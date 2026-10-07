import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, shadows, spacing, typography } from '../../core/theme';
import { DemoCredentialsBanner } from './components/DemoCredentialsBanner';
import { useLoginViewModel } from './useLoginViewModel';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { uiState, setEmail, setPassword, fillDemoCredentials, submit } =
    useLoginViewModel();

  // One-shot navigation on successful login (replaces login on back stack)
  const handleSuccess = useCallback(() => {
    router.replace('/(app)');
  }, [router]);

  const handleSubmit = useCallback(() => {
    submit(handleSuccess);
  }, [submit, handleSuccess]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.title}>Learning Portal</Text>
            <Text style={styles.subtitle}>Sign in to continue your course progress</Text>
          </View>

          <DemoCredentialsBanner
            onAutoFill={fillDemoCredentials}
            disabled={uiState.isLoading}
          />

          {uiState.generalError ? (
            <View style={styles.generalErrorBanner}>
              <Text style={styles.generalErrorText}>{uiState.generalError}</Text>
            </View>
          ) : null}

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={[
                styles.input,
                uiState.emailError ? styles.inputError : null,
              ]}
              placeholder="e.g. demo@learning.com"
              placeholderTextColor={colors.textMuted}
              value={uiState.email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!uiState.isLoading}
              testID="login-email-input"
            />
            {uiState.emailError ? (
              <Text style={styles.inlineErrorText}>{uiState.emailError}</Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={[
                styles.input,
                uiState.passwordError ? styles.inputError : null,
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={uiState.password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!uiState.isLoading}
              testID="login-password-input"
            />
            {uiState.passwordError ? (
              <Text style={styles.inlineErrorText}>{uiState.passwordError}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              uiState.isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={uiState.isLoading}
            activeOpacity={0.8}
            testID="login-submit-button"
            accessibilityRole="button"
            accessibilityState={{ busy: uiState.isLoading }}
          >
            {uiState.isLoading ? (
              <ActivityIndicator color={colors.primaryContrast} />
            ) : (
              <Text style={styles.submitButtonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    ...typography.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  generalErrorBanner: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  generalErrorText: {
    ...typography.sm,
    color: colors.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  inlineErrorText: {
    ...typography.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  submitButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...typography.md,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
});

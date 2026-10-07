/**
 * Application Design Tokens
 * Provides a harmonious, accessible color palette and consistent spacing/typography.
 */

export const colors = {
  // Backgrounds
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Slate 100
  border: '#E2E8F0', // Slate 200
  borderFocus: '#6366F1', // Indigo 500

  // Brand / Action
  primary: '#4F46E5', // Indigo 600
  primaryHover: '#4338CA', // Indigo 700
  primaryLight: '#EEF2FF', // Indigo 50
  primaryContrast: '#FFFFFF',

  // Status & Feedback
  success: '#059669', // Emerald 600
  successLight: '#ECFDF5', // Emerald 50
  warning: '#D97706', // Amber 600
  warningLight: '#FFFBEB', // Amber 50
  error: '#DC2626', // Red 600
  errorLight: '#FEF2F2', // Red 50

  // Text
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Accent / Progress
  progressTrack: '#E2E8F0',
  progressFill: '#4F46E5',
  progressCompleted: '#10B981',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  md: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 22, lineHeight: 28 },
  xxl: { fontSize: 28, lineHeight: 34 },
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

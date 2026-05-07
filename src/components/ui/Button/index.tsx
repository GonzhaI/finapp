import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';

type ButtonKind = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = TouchableOpacityProps & {
  kind?: ButtonKind;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

export function Button({
  kind = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  children,
  ...props
}: Props) {
  const { theme, spacing, radii } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm } as const,
    md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg } as const,
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl } as const,
  };

  const kindStyles = {
    primary: {
      backgroundColor: disabled ? theme.colors.skeleton : theme.colors.accent,
      borderRadius: radii.md,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: disabled ? theme.colors.border : theme.colors.accent,
      borderRadius: radii.md,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: radii.md,
    },
  };

  const textColors: Record<ButtonKind, string> = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.accent,
    ghost: theme.colors.accent,
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        sizeStyles[size],
        kindStyles[kind],
        {
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColors[kind]} size="small" />
      ) : (
        <Text variant="button" color={kind === 'primary' ? 'inverse' : 'accent'}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

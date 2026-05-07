import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';

type Props = RNTextInputProps & {
  label: string;
  error?: string;
  helper?: string;
};

export function Input({ label, error, helper, style, onFocus, onBlur, ...props }: Props) {
  const { theme, spacing, radii, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.expense
    : isFocused
      ? theme.colors.accent
      : theme.colors.border;

  return (
    <View style={{ gap: spacing.xs }}>
      {/* Label */}
      <Text
        variant="subhead"
        color={error ? 'expense' : isFocused ? 'accent' : 'secondary'}
      >
        {label}
      </Text>

      {/* Input */}
      <RNTextInput
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
            borderRadius: radii.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          style,
        ]}
        {...props}
      />

      {/* Error / helper */}
      {(error || helper) && (
        <Text variant="caption" color={error ? 'expense' : 'tertiary'}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}

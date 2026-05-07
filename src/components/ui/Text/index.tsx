import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type TextVariant = 'display' | 'title1' | 'title2' | 'title3' | 'body' | 'subhead' | 'caption' | 'button';

type Props = RNTextProps & {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'income' | 'expense' | 'warning';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
};

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  style,
  children,
  ...props
}: Props) {
  const { theme, typography } = useTheme();

  const colorMap: Record<NonNullable<Props['color']>, string> = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    inverse: theme.colors.textInverse,
    accent: theme.colors.accent,
    income: theme.colors.income,
    expense: theme.colors.expense,
    warning: theme.colors.warning,
  };

  return (
    <RNText
      style={[typography[variant], { color: colorMap[color] }, align && { textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

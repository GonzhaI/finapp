import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type TextVariant =
  | 'hero'
  | 'screenTitle'
  | 'title2'
  | 'title3'
  | 'body'
  | 'statValue'
  | 'subhead'
  | 'itemName'
  | 'caption'
  | 'button'
  | 'label'
  | 'label10'
  | 'micro';

type Props = RNTextProps & {
  variant?: TextVariant;
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'mutedAlt'
    | 'inverse'
    | 'white'
    | 'accent'
    | 'income'
    | 'expense'
    | 'warning'
    | 'info';
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
    mutedAlt: theme.colors.textMutedAlt,
    inverse: theme.colors.textInverse,
    white: theme.colors.textWhite,
    accent: theme.colors.accent,
    income: theme.colors.income,
    expense: theme.colors.expense,
    warning: theme.colors.warning,
    info: theme.colors.info,
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

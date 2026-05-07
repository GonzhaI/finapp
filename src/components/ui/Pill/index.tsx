import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';

type Props = ViewProps & {
  label: string;
  color?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
};

export function Pill({ label, color, icon, size = 'md', style, ...props }: Props) {
  const { theme, radii, spacing } = useTheme();

  const bgColor = color ? `${color}20` : theme.colors.accentBackground;
  const textColor = color ?? theme.colors.accent;

  const sizeStyles = {
    sm: { paddingVertical: 2, paddingHorizontal: spacing.sm } as const,
    md: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md } as const,
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: bgColor,
          borderRadius: radii.pill,
          alignSelf: 'flex-start',
        },
        sizeStyles[size],
        style,
      ]}
      {...props}
    >
      {icon}
      <Text variant={size === 'sm' ? 'caption' : 'subhead'} style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}

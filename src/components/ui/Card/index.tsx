import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ViewProps & {
  children: React.ReactNode;
};

export function Card({ style, children, ...props }: Props) {
  const { theme, radii, shadow } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: radii.lg,
          padding: 16,
          ...shadow.sm,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

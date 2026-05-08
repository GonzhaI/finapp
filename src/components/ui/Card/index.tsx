import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ViewProps & {
  children: React.ReactNode;
  radius?: keyof ReturnType<typeof useTheme>['radii'];
};

export function Card({ style, children, radius, ...props }: Props) {
  const { theme, radii } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: radius ? radii[radius] : radii.card18,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

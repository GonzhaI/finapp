import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';

type Props = ViewProps & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action, style, ...props }: Props) {
  const { spacing } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.md,
        },
        style,
      ]}
      {...props}
    >
      {icon}
      <Text variant="title3" color="secondary">
        {title}
      </Text>
      {description && (
        <Text variant="subhead" color="tertiary" align="center">
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}

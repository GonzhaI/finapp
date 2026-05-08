import React from 'react';
import { View, StyleSheet, Platform, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ViewProps & {
  intensity?: number;
  children: React.ReactNode;
};

export function GlassCard({
  intensity = 40,
  style,
  children,
  ...props
}: Props) {
  const { theme, radii, isDark } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: radii.card18,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={{
          borderRadius: radii.card18,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.glassBorder,
        }}
      >
        {Platform.OS === 'ios' && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: theme.colors.glassHighlight,
            }}
          />
        )}
        <View style={{ padding: 16 }}>{children}</View>
      </BlurView>
    </View>
  );
}

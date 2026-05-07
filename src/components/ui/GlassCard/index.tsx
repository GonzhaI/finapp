import React from 'react';
import { View, StyleSheet, Platform, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeProvider';

type Props = ViewProps & {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
};

export function GlassCard({
  intensity = 40,
  tint,
  style,
  children,
  ...props
}: Props) {
  const { radii, isDark } = useTheme();

  const blurTint = tint ?? (isDark ? 'dark' : 'light');
  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(255, 255, 255, 0.5)';
  const highlightColor = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.6)';

  return (
    <View
      style={[
        {
          borderRadius: radii.lg,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint={blurTint}
        style={{
          borderRadius: radii.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor,
        }}
      >
        {/* Highlight sutil en borde superior */}
        {Platform.OS === 'ios' && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: highlightColor,
            }}
          />
        )}
        <View style={{ padding: 16 }}>{children}</View>
      </BlurView>
    </View>
  );
}

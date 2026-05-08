import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const KNOB_SIZE = 18;
const TRACK_WIDTH = 38;
const TRACK_HEIGHT = 22;
const KNOB_OFFSET = 2;
const TRANSLATE_X = TRACK_WIDTH - KNOB_SIZE - KNOB_OFFSET * 2;

export function Toggle({ value, onValueChange }: Props) {
  const { theme } = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.glassHighlight, theme.colors.accent],
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRANSLATE_X }],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={4}>
      <Animated.View
        style={[
          styles.track,
          {
            borderRadius: TRACK_HEIGHT / 2,
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  knob: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

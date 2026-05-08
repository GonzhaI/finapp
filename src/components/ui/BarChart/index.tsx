import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../Text';
import { formatCurrency } from '@/utils/currency';

export type BarItem = {
  label: string;
  value: number;
  color: string;
  percentage: number;
};

type Props = {
  data: BarItem[];
  currency: string;
  maxBars?: number;
};

export function BarChart({ data, currency, maxBars = 6 }: Props) {
  const { theme, spacing, radii } = useTheme();

  if (data.length === 0) return null;

  const visible = data.slice(0, maxBars);

  return (
    <View style={{ gap: spacing.sm }}>
      {visible.map((item, i) => (
        <View key={`${item.label}-${i}`}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.color,
                }}
              />
              <Text variant="subhead">{item.label}</Text>
            </View>
            <Text variant="subhead" color="secondary">
              {formatCurrency(item.value, currency)}
            </Text>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: radii.sm,
              backgroundColor: theme.colors.separator,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.max(item.percentage, 1)}%`,
                borderRadius: radii.sm,
                backgroundColor: item.color,
              }}
            />
          </View>
          <Text variant="caption" color="tertiary" style={{ marginTop: 2, alignSelf: 'flex-end' }}>
            {item.percentage.toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

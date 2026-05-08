import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';

export default function TabLayout() {
  const { theme } = useTheme();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 10,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: t('tabs.movements'),
          tabBarLabel: t('tabs.movements'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics'),
          tabBarLabel: t('tabs.analytics'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

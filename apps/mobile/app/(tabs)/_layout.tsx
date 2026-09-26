import { usePreview } from '@/features/preview/provider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@meindocs/ui';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { t } = usePreview();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.caption,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home', 'Start'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('Documents', 'Dokumente'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'documents' : 'documents-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: t('Tasks', 'Aufgaben'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="tax"
        options={{
          title: t('Tax', 'Steuern'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: t('More', 'Mehr'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

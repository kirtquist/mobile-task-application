import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform , ActivityIndicator, View} from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { TasksProvider } from "@/contexts/TasksContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
  return (
       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
           <ActivityIndicator />
       </View>
    );
  }
    if (!isAuthenticated) return <Redirect href="/login" />;
        return (
    <TasksProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
        <Tabs.Screen
            name="explore"
            options={{
                title: 'Explore',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
            }}
        />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
        <Tabs.Screen name="tasks_list" options={{ title: "Task List" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
    </TasksProvider>
  );
}

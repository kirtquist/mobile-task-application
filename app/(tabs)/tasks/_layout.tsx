// import React from 'react';
// import { Stack } from 'expo-router';
//
// export default function TasksLayout() {
//     return (
//         <Stack>
//             <Stack.Screen name="tasks_home" options={{ title: 'Tasks' }} />
//             <Stack.Screen
//                 name="new"
//                 options={{
//                     title: 'New Task',
//                     presentation: 'modal', // change to 'card' if you prefer push
//                 }}
//             />
//         </Stack>
//     );
// }

import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useColorScheme} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/Colors";

export default function TasksStackLayout() {
    const router = useRouter();
    const colorScheme = useColorScheme();

    return (
        <Stack
            screenOptions={{

                headerTintColor: Colors[colorScheme ?? 'light'].text,
                headerTitle: 'Tasks',
                headerBackTitle: 'Back',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Tasks',
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/(tabs)/tasks/new')}
                            accessibilityRole="button"
                            accessibilityLabel="Create task"
                            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                        >
                            <Ionicons
                                name={Platform.OS === 'ios' ? 'add' : 'add'}
                                size={24}
                            />
                        </Pressable>
                    ),
                    headerTitleAlign: 'center',
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    title: 'New Task',
                    presentation: 'modal', // iOS-style modal
                }}
            />
        </Stack>
    );
}

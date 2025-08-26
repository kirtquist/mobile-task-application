// app/(tabs)/index.tsx
import React from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useTasksContext } from "@/contexts/TasksContext";
import type { FilterType, Task } from "@/lib/types";
import { useTheme } from '@react-navigation/native';

const FILTERS: FilterType[] = ["all","today","upcoming","completed","overdue"];

export default function TasksScreen() {
    const {
        filteredTasks, loading, error,
        filterType, setFilterType,
        taskCounts, onToggleComplete,
    } = useTasksContext();

    const { colors, dark } = useTheme();
    const muted = dark ? "rgba(235,235,245,0.6)" : "rbga(60,60,67,0.6)";

    if (loading) return (
        <Center>
            <ActivityIndicator color={colors.primary} />
        </Center>
    );

    if (error)   return (
        <Center>
            <Text style={{color: colors.notification}}>{error}</Text>
        </Center>
    );

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.filters}>
                {FILTERS.map((f) => {
                    const isActive = filterType === f;
                    return (
                        <Pressable
                            key={f}
                            onPress={() => setFilterType(f)}
                            style={[
                                styles.chip,
                                { borderColor: colors.border, backgroundColor: colors.card },
                                isActive && { backgroundColor: colors.primary , borderColor: colors.primary},
                                ]}
                        >
                            <Text style={
                                isActive
                                ? [styles.chipTextActive, {color: colors.background} ]
                                    : [styles.chipText, {color: colors.text}]
                            }
                                >
                                {f} ({taskCounts[f]})
                            </Text>
                        </Pressable>
                )})}
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(t) => String(t.id)}
                renderItem={({ item }) => <TaskRow task={item} onToggle={onToggleComplete} />}
                ListEmptyComponent={
                    <Text style={{ color: muted, textAlign: "center", padding: 16}}>
                        No tasks.
                    </Text>}
            />
        </View>
    );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id:number, completed:boolean)=>Promise<void> }) {
    const { colors, dark } = useTheme();
    const muted = dark ? "rgba(235,235,245,0.6)" : "rbga(60,60,67,0.6)";

    return (
        <View style={[styles.row,{borderBottomColor: colors.border}]}>
            <Pressable onPress={() => onToggle(task.id, !task.completed)} style={styles.checkbox}>
                <Text style={{ color: task.completed ? colors.primary : colors.text}}>
                    {task.completed ? "☑" : "☐"}</Text>
            </Pressable>


            <View style={{ flex: 1 }}>
                <Text
                    style={[
                        styles.title,
                        { color: colors.text },
                        task.completed && { textDecorationLine: "line-through", color:muted},
                    ]}>
                    {task.description}
                </Text>
                <Text
                    style={[styles.meta,{ color: muted }
                ]}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                </Text>
                <Text style={[styles.meta, {color: muted}]}>
                    Recurrence in days: {new String(task.recurrence)}
                </Text>
            </View>
        </View>
    );
}

function Center({ children }: { children: React.ReactNode }) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>{children}</View>;
}

const styles = StyleSheet.create({
    container: { flex:1, padding:16, gap:12 },
    filters: { flexDirection:"row", flexWrap:"wrap", gap:8 },
    chip: { borderWidth:1, borderColor:"#ccc", borderRadius:20, paddingVertical:6, paddingHorizontal:10 },
    chipActive: { backgroundColor:"#111", borderColor:"#111" },
    chipText: { color:"#111" },
    chipTextActive: { color:"#fff" },
    row: { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#eee" },
    checkbox: { width:28, alignItems:"center" },
    title: { fontSize:16, fontWeight:"600" },
    completed: { textDecorationLine:"line-through", color:"#777" },
    meta: { color:"#555", fontSize:12 },
});

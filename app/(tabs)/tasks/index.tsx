// app/(tabs)/tasks.tsx
import React from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useTasksContext } from "@/contexts/TasksContext";
import type { FilterType, Task } from "@/lib/types";

const FILTERS: FilterType[] = ["all","today","upcoming","completed","overdue"];

export default function TasksScreen() {
    const {
        filteredTasks, loading, error,
        filterType, setFilterType,
        taskCounts, onToggleComplete,
    } = useTasksContext();

    if (loading) return <Center><ActivityIndicator /></Center>;
    if (error)   return <Center><Text>{error}</Text></Center>;

    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                {FILTERS.map((f) => (
                    <Pressable
                        key={f}
                        onPress={() => setFilterType(f)}
                        style={[styles.chip, filterType === f && styles.chipActive]}
                    >
                        <Text style={filterType === f ? styles.chipTextActive : styles.chipText}>
                            {f} ({taskCounts[f]})
                        </Text>
                    </Pressable>
                ))}
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(t) => String(t.id)}
                renderItem={({ item }) => <TaskRow task={item} onToggle={onToggleComplete} />}
                ListEmptyComponent={<Text>No tasks.</Text>}
            />
        </View>
    );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id:number, completed:boolean)=>Promise<void> }) {
    return (
        <View style={styles.row}>
            <Pressable onPress={() => onToggle(task.id, !task.completed)} style={styles.checkbox}>
                <Text>{task.completed ? "☑" : "☐"}</Text>
            </Pressable>


            <View style={{ flex: 1 }}>
                <Text style={[styles.title, task.completed && styles.completed]}>{task.description}</Text>
                <Text style={styles.meta}>Due: {new Date(task.due_date).toLocaleDateString()}</Text>
                <Text style={styles.meta}>Recurrence in days: {new String(task.recurrence)}</Text>
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

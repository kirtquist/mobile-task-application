// components/UndoBanner.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useTasksContext } from "@/contexts/TasksContext";

export default function UndoBanner() {
    const { undoPending, undoCancel, undoRemainingMs } = useTasksContext();
    if (!undoPending || undoPending.length === 0) return null;

    const job = undoPending[undoPending.length - 1];
    const seconds = Math.ceil((undoRemainingMs(job.id) || 0) / 1000);

    return (
        <View style={styles.wrap} pointerEvents="box-none">
            <View style={styles.banner}>
                <Text style={styles.text}>
                    {job.label ?? "Change pending"} {seconds > 0 ? `— undo in ${seconds}s` : ""}
                </Text>
                <Pressable onPress={() => undoCancel(job.id)} style={styles.btn}>
                    <Text style={styles.btnText}>Undo</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { position: "absolute", left: 0, right: 0, bottom: 20, alignItems: "center" },
    banner: {
        maxWidth: 800, width: "95%",
        paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: Platform.select({ web: "rgba(30,30,30,0.95)", default: "#222" }),
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    text: { color: "#fff" },
    btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: "#444" },
    btnText: { color: "#fff", fontWeight: "600" },
});

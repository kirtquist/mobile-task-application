import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function SettingsTab() {
    const { logout } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Settings</Text>
            <Pressable onPress={logout} style={styles.button}>
                <Text style={styles.buttonText}>Log out</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12, justifyContent: "center" },
    h1: { fontSize: 22, fontWeight: "700" },
    button: { backgroundColor: "#111", padding: 12, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "white", fontWeight: "600" },
});

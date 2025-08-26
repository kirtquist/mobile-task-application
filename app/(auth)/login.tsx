import { View, StyleSheet } from "react-native";
import LoginCard from "../../components/LoginCard";
import { useAuth } from "../../hooks/useAuth";
import { Redirect } from "expo-router";

export default function LoginScreen() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Redirect href="/tasks" />;

    return (
        <View style={styles.container}>
            <LoginCard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
});

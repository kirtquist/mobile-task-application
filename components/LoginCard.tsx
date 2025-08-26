// components/LoginCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {Href, useRouter} from "expo-router";
// ⬇️ Adjust this import path to wherever your AuthContext lives
import {useLoginHandler} from "../hooks/auth"

import { useAuth } from "../hooks/useAuth";

type LoginCredentials = { username: string; password: string };

type LoginCardProps = {
    /** Route to navigate to after successful login (e.g., "/explore2") */
    next?: Href;
    /** Optional title shown above the form */
    title?: string;
    isAuthenticated?: boolean;
    onLogin: (creds: LoginCredentials) => Promise<void>| void;
    onLogout: () => Promise<void>| void;
    /** Prefill fields during local dev; defaults read from EXPO_PUBLIC_* */
    // defaultUsername?: string;
    // defaultPassword?: string;
};

// export default function LoginCard({
//     next = "/tasks",
//     title = "Welcome to the Task Pilot",
//     isAuthenticated,
//     onLogin,
//     onLogout,
//     // defaultUsername = process.env.EXPO_PUBLIC_DEFAULT_USERNAME ?? "",
//     // defaultPassword = process.env.EXPO_PUBLIC_DEFAULT_PASSWORD ?? "",
// }: LoginCardProps) {
//     const router = useRouter();
//     const { login, loading, error, token } = useAuth();
//     // const { handleLogin,  error } = useLoginHandler();
//     // const [loading, setLoading] = useState(false);
//     const [username, setUsername] = useState(process.env.EXPO_PUBLIC_DEFAULT_USERNAME ?? "");
//     const [password, setPassword] = useState(process.env.EXPO_PUBLIC_DEFAULT_PASSWORD ?? "");
//     // const [showPassword, setShowPassword] = useState(false);
//
//     const canSubmit = isAuthenticated || (!!username.trim().length && !!password.length);
//
//     const handlePress = async () => {
//         if (loading || !canSubmit) return;
//         // setLoading(true);
//         // try {
//         //     if (isAuthenticated) {
//         //         await onLogout();
//         //     } else {
//         //         await login(username, password);
//         //         if (next) router.replace(next);
//         //     }
//         //     // if (next) {
//         //     //     router.replace(next);
//         //     // }
//         // } catch (e: any) {
//         //     console.error("ERRORS:",e);
//         // } finally {
//         //     setLoading(false);
//         // }
//         const onSubmit = async () => {
//             if (!username || !password) return;
//             await login(username, password);
//             if (next) router.replace(next);
//         }
//     };

export default function LoginCard() {
    const { login, loading, error } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { isAuthenticated } = useAuth();

    const onSubmit = async () => {
        if (!username || !password) return;
        await login(username, password);
    };

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {/*<Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>*/}
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Welcome to TaskPilot</Text>
            {(
                <View style={{ gap: 8 }}>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="User Name"
                        autoCapitalize="none"
                        keyboardType="name-phone-pad"
                        autoCorrect={false}
                        editable={!loading}
                        style={{
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            backgroundColor: '#fff',
                        }}
                    />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        style={{
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            backgroundColor: '#fff',
                        }}
                    />
                </View>
            )}

            <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={({ pressed }) => ({
                    opacity: pressed || loading ? 0.6 : 1,
                    backgroundColor: '#111827',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                })}
                accessibilityRole="button"
                accessibilityLabel={isAuthenticated ? 'Log Out' : 'Sign In'}
                // accessibilityLabel={loading? 'Log Out' : 'Sign In2'}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                        {isAuthenticated ? 'Log Out' : 'Sign In'}
                        {/*{loading ? 'Log Out' : 'Sign In'}*/}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}

//
//     const [username, setUsername] = useState(defaultUsername);
//     const [password, setPassword] = useState(defaultPassword);
//     const [showPassword, setShowPassword] = useState(false);
//     const canSubmit = useMemo(
//         () => username.trim().length > 0 && password.length > 0 && !loading,
//         [username, password, loading]
//     );
//
//     // If already authenticated, bounce to next
//     useEffect(() => {
//         if (token) {
//             // Small delay to allow UI to render success state if needed
//             const id = setTimeout(() => router.replace(next), 50);
//             return () => clearTimeout(id);
//         }
//     }, [token, router, next]);
//
//     const onSubmit = async () => {
//         if (!canSubmit) return;
//         await login(username.trim(), password); // AuthProvider should flip loading and handle errors
//     };
//
//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === "ios" ? "padding" : undefined}
//             style={styles.wrap}
//         >
//             <View style={styles.card}>
//                 <Text style={styles.title}>{title}</Text>
//
//                 <View style={styles.field}>
//                     <Text style={styles.label}>Username</Text>
//                     <TextInput
//                         value={username}
//                         onChangeText={setUsername}
//                         autoCapitalize="none"
//                         autoCorrect={false}
//                         textContentType="username"
//                         placeholder="you@example.com"
//                         style={styles.input}
//                         editable={!loading}
//                         returnKeyType="next"
//                     />
//                 </View>
//
//                 <View style={styles.field}>
//                     <View style={styles.labelRow}>
//                         <Text style={styles.label}>Password</Text>
//                         <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
//                             <Text style={styles.toggle}>
//                                 {showPassword ? "Hide" : "Show"}
//                             </Text>
//                         </Pressable>
//                     </View>
//                     <TextInput
//                         value={password}
//                         onChangeText={setPassword}
//                         secureTextEntry={!showPassword}
//                         textContentType="password"
//                         placeholder="••••••••"
//                         style={styles.input}
//                         editable={!loading}
//                         returnKeyType="go"
//                         onSubmitEditing={onSubmit}
//                     />
//                 </View>
//
//                 {!!error && (
//                     <View style={styles.errorBox}>
//                         <Text style={styles.errorText}>
//                             {typeof error === "string" ? error : "Login failed"}
//                         </Text>
//                     </View>
//                 )}
//
//                 <Pressable
//                     onPress={onSubmit}
//                     disabled={!canSubmit}
//                     style={[styles.button, !canSubmit && styles.buttonDisabled]}
//                 >
//                     {loading ? (
//                         <ActivityIndicator />
//                     ) : (
//                         <Text style={styles.buttonText}>Sign in</Text>
//                     )}
//                 </Pressable>
//
//                 {/* Dev hint if using EXPO_PUBLIC_* defaults */}
//                 {(defaultUsername || defaultPassword) && (
//                     <Text style={styles.hint}>
//                         Using dev defaults from EXPO_PUBLIC_… env. Clear them for production.
//                     </Text>
//                 )}
//             </View>
//         </KeyboardAvoidingView>
//     );
// }
//
// const styles = StyleSheet.create({
//     wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
//     card: {
//         width: "100%",
//         maxWidth: 420,
//         backgroundColor: "#fff",
//         borderRadius: 16,
//         padding: 20,
//         shadowColor: "#000",
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//         elevation: 4,
//     },
//     title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
//     field: { marginBottom: 14 },
//     label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
//     labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//     toggle: { fontSize: 13, fontWeight: "600" },
//     input: {
//         borderWidth: 1,
//         borderColor: "#ddd",
//         borderRadius: 10,
//         paddingHorizontal: 12,
//         paddingVertical: Platform.OS === "ios" ? 12 : 8,
//         fontSize: 16,
//     },
//     errorBox: {
//         backgroundColor: "#fde8e8",
//         borderRadius: 10,
//         padding: 10,
//         marginBottom: 12,
//     },
//     errorText: { color: "#b42318", fontSize: 14 },
//     button: {
//         height: 48,
//         borderRadius: 12,
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#111827",
//     },
//     buttonDisabled: { opacity: 0.5 },
//     buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//     hint: { marginTop: 10, fontSize: 12, color: "#6b7280" },
// });

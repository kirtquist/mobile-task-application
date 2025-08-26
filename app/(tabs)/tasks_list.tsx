import React, {useEffect, useState, useCallback, useContext} from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BASE_URL } from '../../api/tasks'
import { useAuth } from '@/hooks/useAuth';
import { useTasksContext } from '@/contexts/TasksContext';

// const AuthContext = AuthProvider;


type Item = {
    id: number | string;
    title: string;
    description: string;
    expanded_description: string;
    due_date: string;
    // Add fields from your Django serializer as needed
};

// const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com';
const API_URL = BASE_URL;
const ITEMS_ENDPOINT = `${API_URL}/tasks/`; // e.g., /api/items/ or whatever your endpoint is

const DEFAULT_USERNAME = process.env.EXPO_PUBLIC_DEFAULT_USERNAME ?? 'ksirt';
const DEFAULT_PASSWORD = process.env.EXPO_PUBLIC_DEFAULT_PASSWORD ?? 'x77tasg$$';

export default function Explore2Screen() {
    const [data, setData] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // const { setFilterType, taskCounts,  setIsTaskFormVisible } = useTasksContext();
    // console.log("TASKCOUNTS:",taskCounts.overdue)
    const { token, login } = useAuth();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!token) {
                try {
                    await login(DEFAULT_USERNAME, DEFAULT_PASSWORD);
                } catch (e: any) {
                    if (!cancelled) setError(e?.message ?? 'Login failed');
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, login]);

    const fetchItems = useCallback(async () => {
        if (!token) return;
        try {
            setError(null);
            setLoading(true);
            console.log("TOKEN:",token)
            const res = await fetch(ITEMS_ENDPOINT, {
                headers: {
                    'Content-Type': 'application/json',
                    // Example: add auth if your API requires it
                    // Authorization: 'Bearer <YOUR_TOKEN>',
                    Authorization: `Bearer ${token}`,

                },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed ${res.status}: ${text}`);
            }
            const json = (await res.json()) as Item[]; // adjust if your API wraps results in { results: [...] }
            // If your Django view returns { results: [...] } do: setData((json as any).results)
            setData(Array.isArray(json) ? json : (json as any).results ?? []);
        } catch (e: any) {
            setError(e?.message ?? 'Unknown error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchItems();
        }
    }, [token, fetchItems]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchItems();
    }, [fetchItems]);

    if (loading && data.length === 0) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator />
                <ThemedText style={styles.muted}>Loading…</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Task Pilot</ThemedText>

            {error ? (
                <View style={styles.errorBox}>
                    <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
                </View>
            ) : null}

            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <ThemedText style={styles.rowTitle}>Task due {item.due_date}</ThemedText>
                        <ThemedText style={styles.rowText}>{item.description}</ThemedText>
                        <ThemedText style={styles.rowText}>{item.expanded_description}</ThemedText>
                        {/*<ThemedText style={styles.rowTitle}>:{item.due_date}</ThemedText>*/}
                    </View>
                )}
                ListEmptyComponent={
                    !loading ? <ThemedText style={styles.muted}>No items found.</ThemedText> : null
                }
                contentContainerStyle={data.length === 0 ? styles.center : undefined}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    title: { marginBottom: 12 },
    muted: { opacity: 0.7 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc', opacity: 0.4 },
    row: { paddingVertical: 12 },
    rowTitle: { fontSize: 16, fontWeight: '600' },
    rowText: { fontSize: 14, fontWeight: '500' },
    errorBox: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(255,0,0,0.08)', marginBottom: 12 },
    errorText: { color: '#b00020' },
});

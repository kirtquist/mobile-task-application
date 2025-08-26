import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { NewTask } from '@/lib/types';
import {useTasksContext} from '@/contexts/TasksContext';

export default function NewTaskScreen() {
    const router = useRouter();
    const {editingTask, setEditingTask, updateTask} = useTasksContext();

    const [form, setForm] = useState<NewTask>({
        description: '',
        expanded_description: null,
        due_date: '',
        recurrence: null,
    });

    const disabled = form.description.trim().length === 0;

    const onSave = (e: React.FormEvent) => {
        e.preventDefault();
        const utcDate = new Date(dueDate).toISOString();
        updateTask(form)
        // TODO: replace with your create-task logic (context/mutation/API)
        // e.g., await createTask(form);
        // For now, simply go back after "saving"

        router.back();
    };

    const onCancel = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Create Task</Text>

                <Text style={styles.label}>Title</Text>
                <TextInput
                    value={form.description}
                    onChangeText={(text) => setForm((s) => ({ ...s, description: text }))}
                    placeholder="What do you need to do?"
                    style={styles.input}
                    autoFocus
                    returnKeyType="done"
                />

                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                    value={form.expanded_description ?? ''}
                    onChangeText={(text) =>
                        setForm((s) => ({ ...s, expanded_description: text.length ? text : null }))
                    }
                    placeholder="Additional details"
                    style={[styles.input, styles.multiline]}
                    multiline
                />

                <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
                <TextInput
                    value={form.due_date}
                    onChangeText={(text) => setForm((s) => ({ ...s, due_date: text }))}
                    placeholder="2025-12-31"
                    style={styles.input}
                />

                <Text style={styles.label}>Recurrence (days, optional)</Text>
                <TextInput
                    value={form.recurrence === null ? '' : String(form.recurrence)}
                    onChangeText={(text) =>
                        setForm((s) => ({
                            ...s,
                            recurrence: text.trim() === '' ? null : Number(text) || 0,
                        }))
                    }
                    placeholder="e.g., 7"
                    keyboardType="number-pad"
                    style={styles.input}
                />

                <View style={styles.row}>
                    <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancel]}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onSave}
                        style={[styles.button, disabled ? styles.disabled : styles.primary]}
                        disabled={disabled}
                    >
                        <Text style={[styles.buttonText, styles.primaryText]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        padding: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },
    label: {
        marginTop: 12,
        marginBottom: 6,
        fontSize: 14,
        opacity: 0.8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    cancel: {
        backgroundColor: '#EAECF0',
    },
    primary: {
        backgroundColor: '#1D4ED8',
    },
    disabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFF',
    },
});

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { NewTask } from '@/lib/types';
import {useTasksContext} from '@/contexts/TasksContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import type { GestureResponderEvent } from "react-native";



export default function NewTaskScreen() {
    const router = useRouter();
    const {createNewTask} = useTasksContext();

    const [form, setForm] = useState<NewTask>({
        description: '',
        expanded_description: '',
        due_date: '',
        recurrence: null,
    });
    const isWeb = Platform.OS === "web";

    const disabled = form.description.trim().length === 0;


    // const onSave = React.useCallback((_e?:GestureResponderEvent) => {
    //     console.log(form);
    //     createNewTask(form);
    //     // For now, simply go back after "saving"
    //     router.back();
    // }, [form, createNewTask, router]);

    const onSave = (_e?: GestureResponderEvent) => {
        console.log(form);
        createNewTask(form);
        router.back();
    };

    const onCancel = () => {
        router.back();
    };

// 2) State and helpers for the date-time picker
    const [isDuePickerVisible, setDuePickerVisible] = React.useState(false);

    const parsedDueDate = React.useMemo(() => {
        if (!form.due_date) return null;
        const d = new Date(form.due_date);
        return isNaN(d.getTime()) ? null : d;
    }, [form.due_date]);

    const showDuePicker = () => setDuePickerVisible(true);
    const hideDuePicker = () => setDuePickerVisible(false);

    const formatDateTime = (d?: Date | null) => {
        if (!d) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const formatDisplay = (d?: Date | null) => {
        if (!d) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

// For the HTML input, value must be local "YYYY-MM-DDTHH:mm"
    const toLocalInputValue = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleDueConfirm = (date: Date) => {
        setForm((s) => ({ ...s, due_date: date.toISOString() })); // store ISO for backend
        hideDuePicker();
    };

    const handleWebDueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; // "YYYY-MM-DDTHH:mm" in local time
        if (!val) {
            setForm((s) => ({ ...s, due_date: "" }));
            return;
        }
        const iso = new Date(val).toISOString();
        setForm((s) => ({ ...s, due_date: iso }));
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

                <Text style={styles.label}>Due date and time</Text>
                {isWeb ? (
                    // Web-only input
                    <input
                        type="datetime-local"
                        value={parsedDueDate ? toLocalInputValue(parsedDueDate) : ""}
                        onChange={handleWebDueChange}
                        // Optionally style to match RN TextInput:
                        style={{ padding: 12, borderWidth: 1, borderStyle: "solid", borderColor: "#ccc", borderRadius: 8, width: "100%" }}
                    />
                ) : (
                    // Native modal flow
                    <>
                        <Pressable onPress={showDuePicker}>
                            <TextInput
                                value={formatDisplay(parsedDueDate)}
                                placeholder="YYYY-MM-DD HH:mm"
                                style={styles.input}
                                editable={false}
                                pointerEvents="none"
                            />
                        </Pressable>

                        <DateTimePickerModal
                            isVisible={isDuePickerVisible}
                            mode="datetime"
                            date={parsedDueDate ?? new Date()}
                            onConfirm={handleDueConfirm}
                            onCancel={hideDuePicker}
                        />
                    </>
                )}



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
                        // onPress={() => onSave()}
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

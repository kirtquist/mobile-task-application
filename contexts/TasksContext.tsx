import React, {createContext, useContext, useState, useEffect, useCallback,} from 'react';
import {Task, NewTask, TaskCounts, FilterType} from '../lib/types';
// import { fetchTasks } from '../api/tasks';
// import {apiFetch} from '../api/tasks';
import {apiFetch} from '../lib/storage'
import {useAuth} from '../hooks/useAuth'
import {useUndoableAction} from "../hooks/useUndoableAction";
import {Pressable} from "react-native";

interface TaskDataContext {
    tasks: Task[];
    filteredTasks: Task[];
    loading: boolean;
    error: string | null;
    taskCounts: TaskCounts;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
    onToggleComplete: (taskId: number, completed: boolean) => Promise<void>;
    createNewTask: (task: NewTask) => Promise<void>;
    isTaskFormVisible: boolean;
    setIsTaskFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    editingTask: Task | null;
    setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
    updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
    onDeleteTask: (taskId: number) => void;
    // pendingCompletion: { [id: number]: NodeJS.Timeout };
    isPending: (taskId: number) => boolean;
    clearTasks: () => void;


}



const TasksContext = createContext<TaskDataContext | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    // const [pendingCompletion, setPendingCompletion] = useState<{ [id: number]: NodeJS.Timeout }>({});
    const {isAuthenticated} = useAuth();
    const {user} = useAuth();
    console.log('user in context:', user);
    // console.log('isTaskFormVisible in context:', isTaskFormVisible);    // TODO remove this when done debugging

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch<Task[]>('/tasks/');
            console.log("✅ tasks fetched:", data.length);
            setTasks(data);
            setFilteredTasks(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch tasks' + err);
        } finally {
            setLoading(false);
        }
    }, []);
    // void fetchData().catch((err) => {
    //     console.error('Error in fetchData:', err);
    // });

    useEffect(() => {
        if (!isAuthenticated) {         // Wait to fetch until logged in
            return;
        }
        // void fetchData();
        console.log("🟡 Fetching tasks because user is authenticated:", isAuthenticated);
        console.log('user in context2:', user);
        void fetchData();
        // const fetchData = async () => {
        //     setLoading(true);
        //     setError(null);
        //     try {
        //         const data = await apiFetch<Task[]>('/tasks/');
        //         console.log("✅ tasks fetched:", data.length);
        //         setTasks(data);
        //         setFilteredTasks(data);
        //     } catch (err) {
        //         console.error('Fetch error:', err);
        //         setError('Failed to fetch tasks' + err);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // void fetchData().catch((err) => {
        //     console.error('Error in fetchData:', err);
        // });
    }, [fetchData,isAuthenticated,]);

    useEffect(() => {
        const filtered = filterAndSortTasks(tasks, filterType);
        setFilteredTasks(filtered);
    }, [tasks, filterType]);

    // Filtering & Sorting
    const filterAndSortTasks = (tasks: Task[], filterType: FilterType): Task[] => {
        const today = new Date();
        const filtered = tasks.filter((task) => {
            const due = new Date(task.due_date);
            switch (filterType) {
                case 'completed':
                    return task.completed;
                // case 'incomplete':
                //     return !task.completed;
                case 'today':
                    return (
                        due.getFullYear() === today.getFullYear() &&
                        due.getMonth() === today.getMonth() &&
                        due.getDate() === today.getDate()
                    );
                case 'upcoming':
                    return due > today && !task.completed;
                case 'overdue':
                    return due < today && !task.completed;
                default:
                    return true;
            }
        });

        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const dateA = new Date(a.due_date).getTime();
            const dateB = new Date(b.due_date).getTime();
            return dateA - dateB;
        });
    };

    const taskCounts: TaskCounts = {
        all: tasks.length,
        today: tasks.filter((task) => {
            const today = new Date();
            const due = new Date(task.due_date);
            return due.getFullYear() === today.getFullYear() &&
                due.getMonth() === today.getMonth() &&
                due.getDate() === today.getDate();
        }).length,
        upcoming: tasks.filter((task) => new Date(task.due_date) > new Date() && !task.completed).length,
        completed: tasks.filter((task) => task.completed).length,
        overdue: tasks.filter((task) => new Date(task.due_date) < new Date() && !task.completed).length,
    };

    const undoable = useUndoableAction();

    // Toggling
    const onToggleComplete = (taskId: number, completed: boolean): Promise<void> => {
        return new Promise((resolve) => {
            if (undoable.isPending(taskId)) {
                <Pressable>Undo</Pressable>
                console.log(`Undoing toggle for task ${taskId}`);
                undoable.cancel(taskId);
                return resolve();
            }

            undoable.start({
                id: taskId,
                action: async () => {
                    try {
                        await apiFetch<Task>(`/tasks/${taskId}/toggle_complete/`, { method: 'PATCH' });
                        await fetchData();
                        try {
                            fetchData();
                        } catch (err) {
                            console.error('Failed to fetch data, err')
                        }

                        setTasks((prev) =>
                            prev.map((t) =>
                                t.id === taskId
                                    ? {
                                        ...t,
                                        completed,
                                        completed_at: completed ? new Date().toISOString() : null,
                                    }
                                    : t
                            )
                        );
                    } catch (err) {
                        console.error('Toggle error:', err);
                    } finally {
                        resolve();
                    }
                },
            });
        });
    };


    // console.log(`Pending toggle for task ${taskId}`);

    // Task LifeCycle
    const createNewTask = async (taskData: NewTask) => {
        console.log('Creating new task:', taskData);
        try {
            const newTask = await apiFetch<Task>(`/tasks/`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...taskData,
                    completed: false,
                }),
            });
            setTasks((prev) => [...prev, newTask]);
        } catch (err) {
            console.error('Create task error:', err);
            setError('Unable to create task');
        }
    };

    const updateTask = async (taskId: number, updates: Partial<Task>) => {
        try {
            const updatedTask = await apiFetch<Task>(`/tasks/${taskId}/`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updates),
            });

            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? updatedTask : t))
            );
            setEditingTask(null);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await apiFetch(`/tasks/${taskId}/`, {
                method: 'DELETE',
            });

            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const onDeleteTask = (taskId: number) => {
        // if (!window.confirm('Are you sure you want to delete this task?')) {

        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
        // Use Alert.alert(...) instead of window.confirm for mobile/native
    };

    // Cleanup
    const clearTasks = () => {
        setTasks([]);
        setFilteredTasks([]);
    }


    return (
        <TasksContext.Provider value={{
            tasks,
            filteredTasks,
            loading,
            error,
            taskCounts,
            filterType,
            setFilterType,
            onToggleComplete,
            createNewTask,
            isTaskFormVisible,
            setIsTaskFormVisible,
            editingTask,
            setEditingTask,
            updateTask,
            deleteTask,
            onDeleteTask,
            isPending: undoable.isPending,
            clearTasks,


        }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => {
    const context = useContext(TasksContext);
    if (!context) throw new Error('useTasksContext must be used within a TasksProvider');
    return context;
};

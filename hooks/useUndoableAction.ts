import {useState, useCallback} from 'react';

type Timeout = ReturnType<typeof setTimeout>;

type UndoableAction = {
    id: number;
    action: () => void;
    delay?: number;
};

export const useUndoableAction = () => {
    const [timers, setTimers] = useState<Record<number|string, Timeout>>({});

    const start = useCallback(({id, action, delay = 2000}: UndoableAction) => {
        // Cancel existing timeout if exists
        if (timers[id]) {
            clearTimeout(timers[id]);
        }

        const timeout = setTimeout(() => {
            action();
            setTimers((prev) => {
                const copy = {...prev};
                delete copy[id];
                return copy;
            });
        }, delay);

        setTimers((prev) => ({...prev, [id]: timeout}));
    }, [timers]);


    const cancel = useCallback((id: number | string) => {
        if (timers[id]) {
            clearTimeout(timers[id]);
            setTimers((prev) => {
                const copy = {...prev};
                delete copy[id];
                return copy;
            });
        }
    }, [timers]);

    const isPending = useCallback((id: number | string) => {
        return !!timers[id];
    }, [timers]);

    const clearAll = useCallback(() => {
        Object.values(timers.current).forEach(clearTimeout);
        setTimers({});
    }, [timers]);

    return {
        start,
        cancel,
        isPending,
        clearAll,
    };
};

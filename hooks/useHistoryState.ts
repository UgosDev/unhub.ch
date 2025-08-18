import { useState } from 'react';

// Custom hook per la gestione dello storico per undo/redo
export function useHistoryState<T>(initialState: T) {
    const [state, setStateInternal] = useState({
        history: [initialState],
        index: 0
    });
    const { history, index } = state;

    const setState = (newState: T | ((prevState: T) => T), fromHistory = false) => {
        const resolvedState = typeof newState === 'function'
            ? (newState as (prevState: T) => T)(history[index])
            : newState;

        if (fromHistory) {
            const newHistory = [...history];
            newHistory[index] = resolvedState;
            setStateInternal({ history: newHistory, index });
        } else {
            const newHistory = history.slice(0, index + 1);
            newHistory.push(resolvedState);
            setStateInternal({
                history: newHistory,
                index: newHistory.length - 1
            });
        }
    };

    const undo = () => {
        if (index > 0) {
            setStateInternal(s => ({ ...s, index: s.index - 1 }));
        }
    };

    const redo = () => {
        if (index < history.length - 1) {
            setStateInternal(s => ({ ...s, index: s.index + 1 }));
        }
    };
    
    const resetHistory = (stateValue: T) => {
        setStateInternal({
            history: [stateValue],
            index: 0
        });
    }

    return {
        state: history[index],
        setState,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1,
        resetHistory
    };
}
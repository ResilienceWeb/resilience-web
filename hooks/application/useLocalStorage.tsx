import { useState } from 'react';

export default function useLocalStorage(key, initialValue) {
    const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();

    const [storedValue, setStoredValue] = useState(() => {
        try {
            if (isBrowser) {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            if (isBrowser) {
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}


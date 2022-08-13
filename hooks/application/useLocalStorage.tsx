import { useEffect, useState } from 'react'

export default function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue)

    useEffect(() => {
        if (JSON.parse(localStorage.getItem(key))) {
            setStoredValue(JSON.parse(localStorage.getItem(key)))
        }
    }, [key])

    useEffect(() => {
        if (storedValue !== initialValue) {
            localStorage.setItem(key, JSON.stringify(storedValue))
        }
    }, [initialValue, key, storedValue])

    return [storedValue, setStoredValue]
}

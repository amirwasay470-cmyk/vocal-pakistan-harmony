import { useState, useEffect, useCallback } from "react";

/**
 * Safe client-side persistent state hook with SSR fallbacks and error handling.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with initialValue to prevent SSR hydration mismatches
  const [state, setState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Once mounted on client, read persisted value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  // Set value and save to localStorage
  const setPersistentValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setState((prevState) => {
        const nextState = typeof value === "function" ? (value as (val: T) => T)(prevState) : value;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(nextState));
          }
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
        return nextState;
      });
    },
    [key],
  );

  return [state, setPersistentValue];
}

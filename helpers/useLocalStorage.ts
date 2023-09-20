import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useEventCallback, useEventListener } from 'usehooks-ts'

export function getStorageValue<V>(
  key: string,
  defaultValue: unknown,
  isValid?: isValidFunction<V>,
) {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key)
    const parsed = parseJSON<V>(saved, key)
    if (isValid) {
      return isValid(parsed) ? parsed : (defaultValue as V)
    } else {
      return parsed ?? (defaultValue as V)
    }
  }
  return defaultValue as V
}

type SetValue<T> = Dispatch<SetStateAction<T>>

type isValidFunction<T> = (element?: T) => element is T

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid?: isValidFunction<T>,
): [T, SetValue<T | null>] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      const parsedItem = item ? parseJSON<T>(item, key) : initialValue
      if (isValid) {
        return isValid(parsedItem) ? parsedItem : initialValue
      } else {
        return parsedItem ?? initialValue
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error)
      return initialValue
    }
  }, [initialValue, isValid, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)
  const setValue: SetValue<T | null> = useEventCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`,
      )
    }

    try {
      const newValue = value instanceof Function ? value(storedValue) : value
      window.localStorage.setItem(key, JSON.stringify(newValue))
      newValue && setStoredValue(newValue)
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error)
    }
  })

  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return
      }
      setStoredValue(readValue())
    },
    [key, readValue],
  )

  useEventListener('storage', handleStorageChange)
  useEventListener('local-storage', handleStorageChange)

  return [storedValue, setValue]
}

function parseJSON<T>(value: string | null, key: string): T | undefined {
  try {
    return typeof value === 'undefined' || value === null ? undefined : JSON.parse(value ?? '')
  } catch (error) {
    console.error('parsing error on', { value, key, error })
    return undefined
  }
}

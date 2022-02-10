import { useEffect, useState } from 'react'

function getSessionStorageOrDefault<T>(key: string, defaultValue: T): T {
  const stored = sessionStorage.getItem(key)
  if (!stored) {
    return defaultValue
  }
  return JSON.parse(stored)
}

export function useSessionStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState(getSessionStorageOrDefault(key, defaultValue))

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

import { useEffect, useState } from 'react'

function getStorageValue(key: string, defaultValue: unknown) {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : defaultValue
  }
}

export function useLocalStorage(key: string, defaultValue: unknown) {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue)
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

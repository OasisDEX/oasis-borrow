import { useEffect, useState } from 'react'

export function useTime(refreshCycle = 1000) {
  const [time, setTime] = useState(new Date().getTime())

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date().getTime()), refreshCycle)
    return () => clearInterval(intervalId)
  }) //[refreshCycle, setInterval, clearInterval, setNow]
  return time
}

export const now = new Date(Date.now())
export const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0))

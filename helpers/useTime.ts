import { useEffect, useState } from 'react'

export function useTime(refreshCycle = 1000) {
  const [time, setTime] = useState(new Date().getTime())

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date().getTime()), refreshCycle)
    return () => clearInterval(intervalId)
  }) //[refreshCycle, setInterval, clearInterval, setNow]
  return time
}

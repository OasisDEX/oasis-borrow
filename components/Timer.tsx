import * as React from 'react'

interface TimerProps {
  start: Date
}

export const Timer = ({ start }: TimerProps) => {
  const [accu, tick] = React.useState(0)

  React.useEffect(() => {
    const timerId = setInterval(() => tick(new Date().valueOf() - start.valueOf()), 50)

    return () => clearInterval(timerId)
  }, [])

  const elapsed = Math.round(accu / 1000)
  const minutes = Math.floor(elapsed / 60).toFixed(0)
  const seconds = (elapsed % 60).toFixed(0).padStart(2, '0')

  return (
    <>
      {minutes}:{seconds}
    </>
  )
}

import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Card, SxStyleProp } from 'theme-ui'

export function useTooltip() {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const close = useCallback(() => setTooltipOpen(false), [])

  // @ts-ignore
  useEffect(() => {
    if (tooltipOpen) {
      document.addEventListener('click', close)

      return () => document.removeEventListener('click', close)
    }
  }, [tooltipOpen])

  return { tooltipOpen, setTooltipOpen }
}

export function Tooltip({ children, sx }: { children: ReactNode; sx?: SxStyleProp }) {
  return (
    <Card
      sx={{
        variant: 'cards.tooltip',
        ...sx,
      }}
    >
      {children}
    </Card>
  )
}

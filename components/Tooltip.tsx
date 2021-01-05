import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Box, Card, SxStyleProp } from 'theme-ui'

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
        position: 'absolute',
        top: '-15px',
        right: '0px',
        transform: 'translateY(-100%)',
        boxShadow: 'surface',
        borderRadius: 'large',
        color: 'primary',
        width: ['250px'],
        ...sx,
      }}
    >
      <Box px={1}>{children}</Box>
    </Card>
  )
}

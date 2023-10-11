import { isTouchDevice } from 'helpers/isTouchDevice'
import type { ReactNode } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Card } from 'theme-ui'

export function useTooltip() {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const close = useCallback(() => {
    setTooltipOpen(false)
  }, [])

  useEffect(() => {
    if (tooltipOpen) {
      // capture parameter is added to overcome event phases race condition while rendering portal
      // (opening modal causes tooltip to stop working) - https://github.com/facebook/react/issues/20074#issuecomment-714158332
      document.addEventListener('click', close, { capture: true })

      return () => document.removeEventListener('click', close)
    }
    return () => null
  }, [tooltipOpen])

  return { tooltipOpen, setTooltipOpen }
}

export function Tooltip({ children, sx }: { children: ReactNode; sx?: ThemeUIStyleObject }) {
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

interface StatefulTooltipProps {
  inline?: boolean
  tooltip: ReactNode
  children: ReactNode
  tooltipSx?: ThemeUIStyleObject
  containerSx?: ThemeUIStyleObject
}

export function StatefulTooltip({
  inline,
  tooltip,
  tooltipSx,
  containerSx,
  children,
}: StatefulTooltipProps) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()

  const handleMouseEnter = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(true) : undefined),
    [isTouchDevice],
  )

  const handleMouseLeave = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(false) : undefined),
    [isTouchDevice],
  )

  const handleClick = useCallback(() => tooltip && setTooltipOpen(true), [])

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      sx={{ display: 'flex', ...containerSx }}
      {...(inline && { as: 'span' })}
    >
      {children}
      <Tooltip
        sx={{
          opacity: tooltipOpen ? 1 : 0,
          pointerEvents: tooltipOpen ? 'auto' : 'none',
          transform: tooltipOpen ? 'translateY(0px)' : 'translateY(5px)',
          transition: 'opacity 200ms, transform 200ms',
          ...tooltipSx,
        }}
      >
        {tooltip}
      </Tooltip>
    </Box>
  )
}

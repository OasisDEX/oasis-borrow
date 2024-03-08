import { Tooltip, useTooltip } from 'components/Tooltip'
import { isTouchDevice } from 'helpers/isTouchDevice'
import type { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { Box, Text } from 'theme-ui'

export type HeadlineDetailsProp = {
  label: string
  labelTooltip?: TranslateStringType
  value: string | number
  sub?: string | string[]
  subColor?: string | string[]
}

export function VaultHeadlineDetails({
  label,
  value,
  sub,
  subColor,
  labelTooltip,
}: HeadlineDetailsProp) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()
  return (
    <Box
      onMouseEnter={!isTouchDevice ? () => setTooltipOpen(true) : undefined}
      onMouseLeave={!isTouchDevice ? () => setTooltipOpen(false) : undefined}
      onClick={
        isTouchDevice
          ? () => {
              setTooltipOpen(!tooltipOpen)
            }
          : undefined
      }
      sx={{
        position: 'relative',
        fontSize: 3,
        mt: [2, 0],
        ml: [0, '12px'],
        pl: [0, '12px'],
        '::before': {
          content: ['none', '""'],
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          height: '16px',
          margin: 'auto',
          backgroundColor: 'neutral60',
        },
        ':first-of-type': {
          ml: 0,
          pl: 0,
          '::before': {
            content: 'none',
          },
        },
      }}
    >
      <Text as="span" sx={{ color: 'neutral80' }}>
        {label}
      </Text>
      <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold', color: 'primary100' }}>
        {value}
      </Text>
      {typeof sub === 'string' && subColor && (
        <Text as="span" sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor }}>
          {sub}
        </Text>
      )}
      {Array.isArray(sub) &&
        Array.isArray(subColor) &&
        sub.map((arrSub, arrSubIndex) => (
          <Text
            key={arrSub}
            as="span"
            sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor[arrSubIndex] }}
          >
            {arrSub}
          </Text>
        ))}
      {labelTooltip && tooltipOpen && (
        <Tooltip sx={{ width: ['auto'] }}>
          <Box p={1} sx={{ fontWeight: 'semiBold', fontSize: 1, whiteSpace: 'pre' }}>
            {labelTooltip}
          </Box>
        </Tooltip>
      )}
    </Box>
  )
}

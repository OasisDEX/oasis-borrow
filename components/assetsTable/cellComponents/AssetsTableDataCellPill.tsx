import type { PropsWithChildren } from 'react'
import React from 'react'
import { Text } from 'theme-ui'

export const pillColors = {
  critical: { color: 'critical100', backgroundColor: 'critical10' },
  warning: { color: 'warning100', backgroundColor: 'warning10' },
  success: { color: 'success100', backgroundColor: 'success10' },
  interactive: { color: 'interactive100', backgroundColor: 'interactive10' },
  faded: { color: 'primary30', backgroundColor: 'secondary60' },
}

export function AssetsTableDataCellPill({
  children,
  color,
}: PropsWithChildren<{ color: keyof typeof pillColors }>) {
  return (
    <Text
      as="span"
      sx={{
        p: '6px 12px',
        fontSize: 1,
        fontWeight: 'semiBold',
        borderRadius: 'large',
        whiteSpace: 'pre',
        ...pillColors[color],
      }}
    >
      {children}
    </Text>
  )
}

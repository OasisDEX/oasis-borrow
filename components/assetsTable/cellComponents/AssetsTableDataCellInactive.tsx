import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import { Text } from 'theme-ui'

export function AssetsTableDataCellInactive({ children = 'n/a' }: WithChildren) {
  return (
    <Text as="span" sx={{ color: 'neutral80' }}>
      {children}
    </Text>
  )
}

import React, { PropsWithChildren } from 'react'
import { Text } from 'theme-ui'

export function AssetsTableDataCellInactive({ children = 'n/a' }: PropsWithChildren<{}>) {
  return (
    <Text as="span" sx={{ color: 'neutral80' }}>
      {children}
    </Text>
  )
}

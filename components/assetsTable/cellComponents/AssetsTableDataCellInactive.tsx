import { PropsWithChildren } from 'react'
import { Box } from 'theme-ui'

export function AssetsTableDataCellInactive({ children = 'n/a' }: PropsWithChildren<{}>) {
  return <Box sx={{ color: 'neutral80' }}>{children}</Box>
}

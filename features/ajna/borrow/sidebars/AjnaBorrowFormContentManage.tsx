import { AjnaBorrowPanel } from 'features/ajna/common/types'
import React from 'react'
import { Grid } from 'theme-ui'

interface AjnaBorrowFormContentManageProps {
  panel: AjnaBorrowPanel
}

export function AjnaBorrowFormContentManage({ panel }: AjnaBorrowFormContentManageProps) {
  return <Grid gap={3}>Manage step on {panel} panel</Grid>
}

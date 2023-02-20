import { AjnaBorrowFormController } from 'features/ajna/borrow/controls/AjnaBorrowFormController'
import { AjnaBorrowOverviewController } from 'features/ajna/borrow/controls/AjnaBorrowOverviewController'
import { AjnaPositionView } from 'features/ajna/common/views/AjnaPositionView'
import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/components/AjnaPositionViewPlaceholders'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowPositionController() {
  return (
    <AjnaPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaBorrowOverviewController />
            <AjnaBorrowFormController />
          </Grid>
        ),
        info: <AjnaPositionViewInfoPlaceholder />,
        history: <AjnaPositionViewHistoryPlaceholder />,
      }}
    />
  )
}

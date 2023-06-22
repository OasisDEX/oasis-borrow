import { AjnaBorrowFormController } from 'features/ajna/positions/borrow/controls/AjnaBorrowFormController'
import { AjnaBorrowOverviewController } from 'features/ajna/positions/borrow/controls/AjnaBorrowOverviewController'
import {
  AjnaPositionHistoryController,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/positions/common/controls/AjnaPositionHistoryController'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
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
        history: <AjnaPositionHistoryController />,
      }}
    />
  )
}

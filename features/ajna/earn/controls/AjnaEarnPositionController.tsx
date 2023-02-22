import {
  AjnaPositionViewHistoryPlaceholder,
  AjnaPositionViewInfoPlaceholder,
} from 'features/ajna/common/components/AjnaPositionViewPlaceholders'
import { AjnaPositionView } from 'features/ajna/common/views/AjnaPositionView'
import { AjnaEarnFormController } from 'features/ajna/earn/controls/AjnaEarnFormController'
import { AjnaEarnOverviewController } from 'features/ajna/earn/controls/AjnaEarnOverviewController'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaEarnPositionController() {
  return (
    <AjnaPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaEarnOverviewController />
            <AjnaEarnFormController />
          </Grid>
        ),
        info: <AjnaPositionViewInfoPlaceholder />,
        history: <AjnaPositionViewHistoryPlaceholder />,
      }}
    />
  )
}

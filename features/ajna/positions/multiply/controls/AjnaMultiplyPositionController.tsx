import { AjnaFaqController } from 'features/ajna/positions/common/controls/AjnaFaqController'
import { AjnaPositionHistoryController } from 'features/ajna/positions/common/controls/AjnaPositionHistoryController'
import { AjnaPositionView } from 'features/ajna/positions/common/views/AjnaPositionView'
import { AjnaMultiplyFormController } from 'features/ajna/positions/multiply/controls/AjnaMultiplyFormController'
import { AjnaMultiplyOverviewController } from 'features/ajna/positions/multiply/controls/AjnaMultiplyOverviewController'
import en from 'features/content/faqs/ajna/multiply/en'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaMultiplyPositionController() {
  return (
    <AjnaPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <AjnaMultiplyOverviewController />
            <AjnaMultiplyFormController />
          </Grid>
        ),
        info: <AjnaFaqController content={{ en }} />,
        history: <AjnaPositionHistoryController />,
      }}
    />
  )
}

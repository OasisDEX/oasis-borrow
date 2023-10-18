import en from 'features/content/faqs/ajna/borrow/en'
import { OmniPositionView } from 'features/omni-kit/common/components/OmniPositionView'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow/OmniBorrowFormController'
import { OmniBorrowOverviewController } from 'features/omni-kit/controllers/borrow/OmniBorrowOverviewController'
import { OmniFaqController } from 'features/omni-kit/controllers/common/OmniFaqController'
import { OmniPositionHistoryController } from 'features/omni-kit/controllers/common/OmniPositionHistoryController'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniBorrowPositionController() {
  return (
    <OmniPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <OmniBorrowOverviewController />
            <OmniBorrowFormController />
          </Grid>
        ),
        info: <OmniFaqController content={{ en }} />,
        history: <OmniPositionHistoryController />,
      }}
    />
  )
}

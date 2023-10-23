import en from 'features/content/faqs/ajna/borrow/en'
import { OmniPositionView } from 'features/omni-kit/common/components/OmniPositionView'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow/OmniBorrowFormController'
import { OmniFaqController } from 'features/omni-kit/controllers/common/OmniFaqController'
import { OmniOverviewController } from 'features/omni-kit/controllers/common/OmniOverviewController'
import { OmniPositionHistoryController } from 'features/omni-kit/controllers/common/OmniPositionHistoryController'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniBorrowPositionController({ txHandler }: { txHandler: () => () => void }) {
  return (
    <OmniPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <OmniOverviewController />
            <OmniBorrowFormController txHandler={txHandler} />
          </Grid>
        ),
        info: <OmniFaqController content={{ en }} />,
        history: <OmniPositionHistoryController />,
      }}
    />
  )
}

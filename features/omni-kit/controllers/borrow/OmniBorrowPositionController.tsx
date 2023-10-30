import en from 'features/content/faqs/ajna/borrow/en'
import {
  OmniFaqController,
  OmniOverviewController,
  OmniPositionHistoryController,
} from 'features/omni-kit/controllers'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow'
import { OmniPositionView } from 'features/omni-kit/views'
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

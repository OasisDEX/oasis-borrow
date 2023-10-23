import en from 'features/content/faqs/ajna/multiply/en'
import {
  OmniFaqController,
  OmniOverviewController,
  OmniPositionHistoryController,
} from 'features/omni-kit/controllers'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply'
import { OmniPositionView } from 'features/omni-kit/views'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniMultiplyPositionController({ txHandler }: { txHandler: () => () => void }) {
  return (
    <OmniPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <OmniOverviewController />
            <OmniMultiplyFormController txHandler={txHandler} />
          </Grid>
        ),
        info: <OmniFaqController content={{ en }} />,
        history: <OmniPositionHistoryController />,
      }}
    />
  )
}

import en from 'features/content/faqs/ajna/multiply/en'
import { OmniPositionView } from 'features/omni-kit/components/OmniPositionView'
import { OmniFaqController } from 'features/omni-kit/controllers/common/OmniFaqController'
import { OmniPositionHistoryController } from 'features/omni-kit/controllers/common/OmniPositionHistoryController'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply/OmniMultiplyFormController'
import { OmniMultiplyOverviewController } from 'features/omni-kit/controllers/multiply/OmniMultiplyOverviewController'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniMultiplyPositionController() {
  return (
    <OmniPositionView
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <OmniMultiplyOverviewController />
            <OmniMultiplyFormController />
          </Grid>
        ),
        info: <OmniFaqController content={{ en }} />,
        history: <OmniPositionHistoryController />,
      }}
    />
  )
}

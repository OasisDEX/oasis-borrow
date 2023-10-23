import en from 'features/content/faqs/ajna/multiply/en'
import { OmniPositionView } from 'features/omni-kit/common/components/OmniPositionView'
import { OmniFaqController } from 'features/omni-kit/controllers/common/OmniFaqController'
import { OmniOverviewController } from 'features/omni-kit/controllers/common/OmniOverviewController'
import { OmniPositionHistoryController } from 'features/omni-kit/controllers/common/OmniPositionHistoryController'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply/OmniMultiplyFormController'
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

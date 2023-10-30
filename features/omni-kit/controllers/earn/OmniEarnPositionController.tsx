import en from 'features/content/faqs/ajna/earn/en'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniFaqController,
  OmniOverviewController,
  OmniPositionHistoryController,
} from 'features/omni-kit/controllers'
import { OmniEarnFormController } from 'features/omni-kit/controllers/earn'
import { OmniProductType } from 'features/omni-kit/types'
import { OmniPositionView } from 'features/omni-kit/views'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniEarnPositionController({ txHandler }: { txHandler: () => () => void }) {
  const {
    dynamicMetadata: {
      values: { headlineDetails },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <OmniPositionView
      headlineDetails={headlineDetails}
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <OmniOverviewController />
            <OmniEarnFormController txHandler={txHandler} />
          </Grid>
        ),
        info: <OmniFaqController content={{ en }} />,
        history: <OmniPositionHistoryController />,
      }}
    />
  )
}

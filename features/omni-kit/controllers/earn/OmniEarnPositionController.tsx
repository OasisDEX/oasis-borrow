import en from 'features/content/faqs/ajna/earn/en'
import { OmniPositionView } from 'features/omni-kit/common/components/OmniPositionView'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniFaqController } from 'features/omni-kit/controllers/common/OmniFaqController'
import { OmniOverviewController } from 'features/omni-kit/controllers/common/OmniOverviewController'
import { OmniPositionHistoryController } from 'features/omni-kit/controllers/common/OmniPositionHistoryController'
import { OmniEarnFormController } from 'features/omni-kit/controllers/earn/OmniEarnFormController'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniEarnPositionController({ txHandler }: { txHandler: () => () => void }) {
  const { dynamicMetadata } = useOmniProductContext('earn')

  const {
    values: { headlineDetails },
  } = dynamicMetadata('earn')

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

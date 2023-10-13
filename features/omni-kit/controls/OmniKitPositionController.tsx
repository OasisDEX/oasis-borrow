import { useOmniKitContext } from 'features/omni-kit/contexts/OmniKitContext'
import { OmniKitPositionView } from 'features/omni-kit/views/OmniKitPositionView'
import { upperFirst } from 'lodash'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniKitPositionController() {
  const {
    environment: {
      collateralToken,
      dpmProxy,
      isOwner,
      isSetup,
      network,
      owner,
      positionId,
      productType,
      protocol,
      quoteToken,
    },
    hooks: { useHeadlineDetails },
  } = useOmniKitContext()

  const header = isSetup
    ? `New ${collateralToken}/${quoteToken} ${upperFirst(productType)}`
    : `${collateralToken}/${quoteToken} ${upperFirst(productType)} #${positionId}`
  const details = useHeadlineDetails()

  return (
    <OmniKitPositionView
      dpmProxy={dpmProxy}
      headline={{
        tokens: [collateralToken, quoteToken],
        header,
        protocol: { network, protocol },
        details,
      }}
      isOwner={isOwner}
      isSetup={isSetup}
      owner={owner}
      tabs={{
        position: (
          <Grid variant="vaultContainer">
            <Grid gap={2}>WIP</Grid>
          </Grid>
        ),
        info: <>Info</>,
        history: <>History</>,
      }}
    />
  )
}

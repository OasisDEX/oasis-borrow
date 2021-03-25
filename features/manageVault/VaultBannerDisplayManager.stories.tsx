import { BigNumber } from 'bignumber.js'
import { moreMinutes, nextHour } from 'helpers/time'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'

import { VaultBannerDisplayManager } from './VaultBannerDisplayManager'

const protoVaultState = {
  id: new BigNumber(1),
  token: 'ETH',
  liquidationPrice: new BigNumber(588.44),
  nextCollateralPrice: new BigNumber(526.44),
  dateNextCollateralPrice: nextHour,
}

const DistantPriceUpdateCountdown = () => (
  <Box>
    <Heading as="h2" sx={{ mb: 2 }}>
      {' '}
      Liquidation price update that will happen later than 2 minutes
    </Heading>
    <VaultBannerDisplayManager {...protoVaultState} />
  </Box>
)
const UpcomingPriceUpdateCountdown = () => (
  <Box>
    <Heading as="h2" sx={{ mb: 2 }}>
      {' '}
      Liquidation price update in less than 2 minutes
    </Heading>
    <VaultBannerDisplayManager
      {...{ ...protoVaultState, dateNextCollateralPrice: moreMinutes(1) }}
    />
  </Box>
)

export const VaultLiquidationWarning = () => {
  return (
    <Grid gap={4}>
      <DistantPriceUpdateCountdown />
      <UpcomingPriceUpdateCountdown />
    </Grid>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Vault Banner Display Manager',
  component: VaultBannerDisplayManager,
}

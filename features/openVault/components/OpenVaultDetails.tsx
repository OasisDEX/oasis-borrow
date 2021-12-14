import React from 'react'
import { Grid } from 'theme-ui'

import { CardCollateralizationRatio } from './details/CardCollateralizationRatio'
import { CardCollateralLocked } from './details/CardCollateralLocked'
import { CardCurrentPrice } from './details/CardCurrentPrice'
import { CardLiquidationPrice } from './details/CardLiquidationPrice'
import { OpenVaultDetailsSummary } from './details/Summary'

export function OpenVaultDetails() {
  return (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <CardLiquidationPrice />
        <CardCollateralizationRatio />
        <CardCurrentPrice />
        <CardCollateralLocked />
      </Grid>
      <OpenVaultDetailsSummary />
    </>
  )
}

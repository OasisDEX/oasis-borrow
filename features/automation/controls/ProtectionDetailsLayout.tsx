import BigNumber from 'bignumber.js'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardDynamicStopPrice } from 'components/vault/detailsCards/VaultDetailsCardDynamicStopPrice'
import { VaultDetailsCardMaxTokenOnStopLossTrigger } from 'components/vault/detailsCards/VaultDetailsCardMaxTokenOnStopLossTrigger'
import { VaultDetailsCardStopLossCollRatio } from 'components/vault/detailsCards/VaultDetailsCardStopLossCollRatio'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { calculatePricePercentageChange } from '../../../blockchain/prices'
import { getAfterPillColors } from '../../../components/vault/VaultDetails'
import { zero } from '../../../helpers/zero'

export interface ProtectionDetailsLayoutProps {
  slRatio: BigNumber
  vaultDebt: BigNumber
  currentOraclePrice: BigNumber
  nextOraclePrice: BigNumber
  isStaticPrice: boolean
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
  liquidationRatio: BigNumber
  afterSlRatio: BigNumber
}

export function ProtectionDetailsLayout({
  slRatio,
  vaultDebt,
  currentOraclePrice,
  nextOraclePrice,
  isStaticPrice,
  isStopLossEnabled,
  lockedCollateral,
  token,
  liquidationRatio,
  afterSlRatio,
}: ProtectionDetailsLayoutProps) {
  const showAfterPill = slRatio.eq(zero)
    ? !liquidationRatio.eq(afterSlRatio)
    : !slRatio.eq(afterSlRatio)

  const afterPillColors = getAfterPillColors('onSuccess')

  const percentageChange = calculatePricePercentageChange(currentOraclePrice, nextOraclePrice)
  const collateralizationRatio = lockedCollateral.times(currentOraclePrice).div(vaultDebt)

  const liquidationPrice = vaultDebt.times(liquidationRatio).div(lockedCollateral)

  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardStopLossCollRatio
          slRatio={slRatio}
          collateralizationRatio={collateralizationRatio}
          isProtected={isStopLossEnabled}
          showAfterPill={showAfterPill}
          afterSlRatio={afterSlRatio}
          afterPillColors={afterPillColors}
        />
        <VaultDetailsCardDynamicStopPrice
          slRatio={slRatio}
          liquidationPrice={liquidationPrice}
          liquidationRatio={liquidationRatio}
          isProtected={isStopLossEnabled}
          showAfterPill={showAfterPill}
          afterSlRatio={afterSlRatio}
          afterPillColors={afterPillColors}
        />
        <VaultDetailsCardCurrentPrice
          currentCollateralPrice={currentOraclePrice}
          nextCollateralPrice={nextOraclePrice}
          isStaticCollateralPrice={isStaticPrice}
          collateralPricePercentageChange={percentageChange}
        />

        <VaultDetailsCardMaxTokenOnStopLossTrigger
          slRatio={slRatio}
          isProtected={isStopLossEnabled}
          liquidationPrice={liquidationPrice}
          debt={vaultDebt}
          liquidationRatio={liquidationRatio}
          token={token}
          showAfterPill={showAfterPill}
          lockedCollateral={lockedCollateral}
          afterSlRatio={afterSlRatio}
          afterPillColors={afterPillColors}
        />
      </Grid>
    </Box>
  )
}

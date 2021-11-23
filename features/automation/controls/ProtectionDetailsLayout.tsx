import BigNumber from 'bignumber.js'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardDynamicStopPrice } from 'components/vault/detailsCards/VaultDetailsCardDynamicStopPrice'
import { VaultDetailsCardMaxTokenOnStopLossTrigger } from 'components/vault/detailsCards/VaultDetailsCardMaxTokenOnStopLossTrigger'
import { VaultDetailsCardStopLossCollRatio } from 'components/vault/detailsCards/VaultDetailsCardStopLossCollRatio'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { IlkData } from '../../../blockchain/ilks'
import { getAfterPillColors, getCollRatioColor } from '../../../components/vault/VaultDetails'

export interface ProtectionState {
  ilkData: IlkData
  inputAmountsEmpty: boolean
  stage: string // prepare protection stages
  afterCollateralizationRatio: BigNumber
  afterSlRatio: BigNumber
  afterDebt: BigNumber
  afterLiquidationPrice: BigNumber
  afterLockedCollateral: BigNumber
}

export interface ProtectionDetailsLayoutProps {
  // context
  slRatio: BigNumber
  vaultDebt: BigNumber
  currentOraclePrice: BigNumber
  nextOraclePrice: BigNumber
  percentageChange: BigNumber
  isStaticPrice: boolean
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
  collateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber

  // protection state
  protectionState: ProtectionState
}

export function ProtectionDetailsLayout({
  // context
  slRatio,
  vaultDebt,
  currentOraclePrice,
  nextOraclePrice,
  percentageChange,
  isStaticPrice,
  isStopLossEnabled,
  lockedCollateral,
  token,
  collateralizationRatio,
  liquidationPrice,
  liquidationRatio,

  // protection state
  protectionState: {
    ilkData,
    stage,
    inputAmountsEmpty,
    afterCollateralizationRatio,
    afterSlRatio,
    afterDebt,
    afterLiquidationPrice,
    afterLockedCollateral,
  },
}: ProtectionDetailsLayoutProps) {
  const showAfterPill = !inputAmountsEmpty && stage !== 'protectionSuccess'

  const afterCollRatioColor = getCollRatioColor(
    { ilkData, inputAmountsEmpty },
    afterCollateralizationRatio,
  )
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
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
          afterLiquidationPrice={afterLiquidationPrice}
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
          collateralAmountLocked={lockedCollateral}
          liquidationRatio={liquidationRatio}
          token={token}
          showAfterPill={showAfterPill}
          afterLockedCollateral={afterLockedCollateral}
          afterLiquidationPrice={afterLiquidationPrice}
          afterDebt={afterDebt}
          afterSlRatio={afterSlRatio}
          afterPillColors={afterPillColors}
        />
      </Grid>
    </Box>
  )
}

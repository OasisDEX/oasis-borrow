import React from 'react'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { Box, Grid } from 'theme-ui'
import { getAfterPillColors, getCollRatioColor, VaultDetailsCardCollateralLocked, VaultDetailsCardCollateralizationRatio, VaultDetailsCardCurrentPrice, VaultDetailsCardLiquidationPrice } from 'components/vault/VaultDetails'
import { ManageVaultDetailsSummary } from 'features/borrow/manage/containers/ManageVaultDetails'


export function ManageInstiVaultDetails(props: ManageVaultState) {
  const {
    vault: {
      token,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
    },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    inputAmountsEmpty,
    stage,
  } = props
  
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'

  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          {...{
            liquidationPrice,
            liquidationPriceCurrentPriceDifference,
            afterLiquidationPrice,
            afterPillColors,
            showAfterPill,
          }}
        />
        <VaultDetailsCardCollateralizationRatio 
          afterPillColors={afterPillColors} 
          showAfterPill={showAfterPill}
          {...props}
        />
        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          afterPillColors={afterPillColors}
          showAfterPill={showAfterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </Box>
  )
}

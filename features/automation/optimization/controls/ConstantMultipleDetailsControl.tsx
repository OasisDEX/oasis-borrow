import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { calculatePNL } from 'helpers/multiply/calculations'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
}

export function ConstantMultipleDetailsControl({
  vault,
  vaultHistory,
  tokenMarketPrice,
  constantMultipleTriggerData,
}: ConstantMultipleDetailsControlProps) {
  const { debt, lockedCollateral, token } = vault
  const netValueUSD = lockedCollateral.times(tokenMarketPrice).minus(debt)
  const isTriggerEnabled = constantMultipleTriggerData.isTriggerEnabled
  const triggerColRatioToBuy = constantMultipleTriggerData.buyExecutionCollRatio
  const triggerColRatioToSell = constantMultipleTriggerData.sellExecutionCollRatio

  const constantMultipleDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      targetMultiple: calculateMultipleFromTargetCollRatio(
        constantMultipleTriggerData.targetCollRatio,
      ),
      targetColRatio: constantMultipleTriggerData.targetCollRatio,
      // TODO: PK calculate based on history entry
      totalCost: new BigNumber(3000),
      // TODO: PK vaultHistory should be cut down right after first found set up multiply event
      PnLSinceEnabled: calculatePNL(vaultHistory, netValueUSD),
      triggerColRatioToBuy,
      triggerColRatioToSell,
      nextBuyPrice: collateralPriceAtRatio({
        colRatio: triggerColRatioToBuy.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
      nextSellPrice: collateralPriceAtRatio({
        colRatio: triggerColRatioToSell.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
    }),
  }

  return (
    <Grid>
      <ConstantMultipleDetailsLayout
        token={token}
        isTriggerEnabled={isTriggerEnabled}
        {...constantMultipleDetailsLayoutOptionalParams}
      />
    </Grid>
  )
}

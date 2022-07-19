import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { ConstantMultiplyTriggerData } from 'features/automation/common/constantMultiplyTriggerData'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
  constantMultiplyTriggerData: ConstantMultiplyTriggerData
}

export function ConstantMultipleDetailsControl({
  vault,
  constantMultiplyTriggerData,
}: ConstantMultipleDetailsControlProps) {
  // TODO: get those values from constantMultiplyTriggerData when there is actual data
  const targetMultiple = new BigNumber(2)
  const targetColRatio = new BigNumber(200)
  const totalCost = new BigNumber(3000)
  const PnLSinceEnabled = new BigNumber(48.25)
  const triggerColRatioToBuy = new BigNumber(220)
  const triggerColRatioToSell = new BigNumber(180)
  // ENDTODO
  const nextBuyPrice = collateralPriceAtRatio({
    colRatio: triggerColRatioToBuy.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const nextSellPrice = collateralPriceAtRatio({
    colRatio: triggerColRatioToSell.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  return (
    <Grid>
      <ConstantMultipleDetailsLayout
        token={vault.token}
        targetMultiple={targetMultiple}
        targetColRatio={targetColRatio}
        totalCost={totalCost}
        PnLSinceEnabled={PnLSinceEnabled}
        triggerColRatioToBuy={triggerColRatioToBuy}
        nextBuyPrice={nextBuyPrice}
        triggerColRatioToSell={triggerColRatioToSell}
        nextSellPrice={nextSellPrice}
        constantMultiplyTriggerData={constantMultiplyTriggerData}
      />
    </Grid>
  )
}

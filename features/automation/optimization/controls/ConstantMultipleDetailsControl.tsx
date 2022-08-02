import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { calculatePNL } from 'helpers/multiply/calculations'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
  // TODO: PK use constantMultiplyTriggerData in interface
}

export function ConstantMultipleDetailsControl({
  vault,
  vaultHistory,
  tokenMarketPrice,
}: // TODO: PK get constantMultiplyTriggerData here
ConstantMultipleDetailsControlProps) {
  const { debt, lockedCollateral, token } = vault
  const netValueUSD = lockedCollateral.times(tokenMarketPrice).minus(debt)
  // TODO: PK get those values from constantMultiplyTriggerData when there is actual data
  const isTriggerEnabled = false
  const targetMultiple = new BigNumber(2)
  const totalCost = new BigNumber(3000)
  const triggerColRatioToBuy = new BigNumber(220)
  const triggerColRatioToSell = new BigNumber(180)
  const targetColRatio = isTriggerEnabled ? new BigNumber(200) : undefined
  // TODO: PK vaultHistory should be cut down right after first found set up multiply event
  const PnLSinceEnabled = isTriggerEnabled ? calculatePNL(vaultHistory, netValueUSD) : undefined
  const nextBuyPrice = isTriggerEnabled
    ? collateralPriceAtRatio({
        colRatio: triggerColRatioToBuy.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      })
    : undefined
  const nextSellPrice = isTriggerEnabled
    ? collateralPriceAtRatio({
        colRatio: triggerColRatioToSell.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      })
    : undefined

  return (
    <Grid>
      <ConstantMultipleDetailsLayout
        token={token}
        isTriggerEnabled={isTriggerEnabled}
        targetMultiple={targetMultiple}
        targetColRatio={targetColRatio}
        totalCost={totalCost}
        PnLSinceEnabled={PnLSinceEnabled}
        triggerColRatioToBuy={triggerColRatioToBuy}
        nextBuyPrice={nextBuyPrice}
        triggerColRatioToSell={triggerColRatioToSell}
        nextSellPrice={nextSellPrice}
      />
    </Grid>
  )
}

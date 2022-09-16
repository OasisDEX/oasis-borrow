import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import React from 'react'

import { AutoTakeProfitDetailsLayout } from './AutoTakeProfitDetailsLayout'

interface AutoTakeProfitDetailsControlProps {
  vault: Vault
}

export function AutoTakeProfitDetailsControl({ vault }: AutoTakeProfitDetailsControlProps) {
  const isDebtZero = vault.debt.isZero()
  // TODO: TDAutoTakeProfit | to be replaced with data from autoTakeProfitTriggerData or autoTakeProfitState
  // or from calculations based on those states
  const isTriggerEnabled = false
  const triggerColPrice = new BigNumber(1904)
  const afterTriggerColPrice = new BigNumber(1964)
  const estimatedProfit = new BigNumber(399040200)
  const triggerColRatio = new BigNumber(210.37)
  const afterTriggerColRatio = new BigNumber(222.32)
  // TODO: TDAutoTakeProfit | commented out due to not being used right now
  // const isEditing = false

  const autoTakeProfitDetailsLayoutOptionalParams = {
    // TODO: TDAutoTakeProfit | shoule be passed only when trigger is enabled, can't be done in current state because var is always false and it causes typescript error
    // Spread types may only be created from object types.ts(2698)
    // ...(isTriggerEnabled && {
    triggerColPrice,
    estimatedProfit,
    triggerColRatio,
    // }),
    // TODO: TDAutoTakeProfit | shoule be passed only when is in editing stage, can't be done in current state because var is always false and it causes typescript error
    // Spread types may only be created from object types.ts(2698)
    // ...(isEditing && {
    afterTriggerColPrice,
    afterTriggerColRatio,
    // }),
    currentColRatio: vault.collateralizationRatio.times(100),
  }

  if (isDebtZero) return null

  return (
    <AutoTakeProfitDetailsLayout
      isTriggerEnabled={isTriggerEnabled}
      token={vault.token}
      {...autoTakeProfitDetailsLayoutOptionalParams}
    />
  )
}

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
  // TODO: TDAutoTakeProfit | to be replaced with data from checkIfIsEditingAutoTakeProfit
  const isEditing = false

  const autoTakeProfitDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColPrice,
      estimatedProfit,
    }),
    ...(isEditing && {
      afterTriggerColPrice,
    }),
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

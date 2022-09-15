import { Vault } from 'blockchain/vaults'
import React from 'react'

import { AutoTakeProfitDetailsLayout } from './AutoTakeProfitDetailsLayout'

interface AutoTakeProfitDetailsControlProps {
  vault: Vault
}

export function AutoTakeProfitDetailsControl({ vault }: AutoTakeProfitDetailsControlProps) {
  //TODO: TDAutoTakeProfit | to be replaced with data from autoTakeProfitTriggerData when its available
  const isTriggerEnabled = false

  return <AutoTakeProfitDetailsLayout isTriggerEnabled={isTriggerEnabled} token={vault.token} />
}

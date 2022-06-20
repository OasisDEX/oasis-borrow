import { Vault } from 'blockchain/vaults'
import React from 'react'

import { OptimizationDetailsLayout } from './OptimizationDetailsLayout'

interface OptimizationDetailsControlProps {
  isAutoBuyOn: boolean
  vault: Vault
}

export function OptimizationDetailsControl({
  isAutoBuyOn,
  vault,
}: OptimizationDetailsControlProps) {
  return <OptimizationDetailsLayout isAutoBuyOn={isAutoBuyOn} vault={vault} />
}

import { Vault } from 'blockchain/vaults'
import React from 'react'

import { OptimizationDetailsLayout } from './OptimizationDetailsLayout'
interface OptimizationDetailsControlProps {
  vault: Vault
}

export function OptimizationDetailsControl({ vault }: OptimizationDetailsControlProps) {
  return <OptimizationDetailsLayout vault={vault} />
}

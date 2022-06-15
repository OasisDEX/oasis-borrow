import { Vault } from 'blockchain/vaults'
import React from 'react'

import { OptimizationDetailsLayout } from './OptimizationDetailsLayout'
interface OptimizationDetailsControlProps {
  isAutoBuyOn: boolean
  isEditingAutoBuy: boolean
  vault: Vault
}

export function OptimizationDetailsControl({
  isAutoBuyOn,
  isEditingAutoBuy,
  vault,
}: OptimizationDetailsControlProps) {
  return (
    <OptimizationDetailsLayout
      vault={vault}
      isAutoBuyOn={isAutoBuyOn}
      isEditingAutoBuy={isEditingAutoBuy}
    />
  )
}

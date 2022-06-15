import { Vault } from 'blockchain/vaults'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import React from 'react'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  vault: Vault
}

export function OptimizationFormControl({ isAutoBuyOn, vault }: OptimizationFormControlProps) {
  return <SidebarSetupAutoBuy isAutoBuyOn={isAutoBuyOn} vault={vault} />
}

import { Vault } from 'blockchain/vaults'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import React from 'react'

interface OptimizationFormControlProps {
  vault: Vault
}

export function OptimizationFormControl({ vault }: OptimizationFormControlProps) {
  return <SidebarSetupAutoBuy vault={vault} />
}

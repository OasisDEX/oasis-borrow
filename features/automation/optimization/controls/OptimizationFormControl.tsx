import { Vault } from 'blockchain/vaults'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import React from 'react'

interface OptimizationFormControlProps {
  isAutoBuyOn: boolean
  isEditingAutoBuy: boolean
  vault: Vault
}

export function OptimizationFormControl({
  isAutoBuyOn,
  isEditingAutoBuy,
  vault,
}: OptimizationFormControlProps) {
  return (
    <SidebarSetupAutoBuy
      vault={vault}
      isAutoBuyOn={isAutoBuyOn}
      isEditingAutoBuy={isEditingAutoBuy}
    />
  )
}

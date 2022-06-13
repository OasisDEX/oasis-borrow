import { Vault } from 'blockchain/vaults'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import React from 'react'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface OptimizationControlProps {
  vault: Vault
}

export function OptimizationControl({ vault }: OptimizationControlProps) {
  return (
    <DefaultVaultLayout
      detailsViewControl={<OptimizationDetailsControl vault={vault} />}
      editForm={<OptimizationFormControl vault={vault} />}
    />
  )
}

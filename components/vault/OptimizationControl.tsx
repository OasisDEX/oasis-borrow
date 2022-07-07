import { Vault } from 'blockchain/vaults'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import React, { useState } from 'react'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface OptimizationControlProps {
  vault: Vault
}

export function OptimizationControl({ vault }: OptimizationControlProps) {
  const [isAutoBuyOn] = useState<boolean>(false) // should be taken from pipeline or triggers, probably on component leve, not here

  return (
    <DefaultVaultLayout
      detailsViewControl={<OptimizationDetailsControl isAutoBuyOn={isAutoBuyOn} vault={vault} />}
      editForm={<OptimizationFormControl isAutoBuyOn={isAutoBuyOn} vault={vault} />}
    />
  )
}

import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import React from 'react'

export function GasEstimation() {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation)}</>
}

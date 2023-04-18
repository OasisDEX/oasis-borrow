import BigNumber from 'bignumber.js'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import React from 'react'

interface GasEstimationProps {
  addition?: BigNumber
}

export function GasEstimation({ addition }: GasEstimationProps) {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation, addition)}</>
}

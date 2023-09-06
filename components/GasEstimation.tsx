import React from 'react'
import BigNumber from 'bignumber.js'
import { useGasEstimationContext } from 'components/context'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'

interface GasEstimationProps {
  addition?: BigNumber
}

export function GasEstimation({ addition }: GasEstimationProps) {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation, addition)}</>
}

import type BigNumber from 'bignumber.js'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import React from 'react'

import { useGasEstimationContext } from './context/GasEstimationContextProvider'

interface GasEstimationProps {
  addition?: BigNumber
}

export function GasEstimation({ addition }: GasEstimationProps) {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation, addition)}</>
}

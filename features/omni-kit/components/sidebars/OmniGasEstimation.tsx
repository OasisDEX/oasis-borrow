import type BigNumber from 'bignumber.js'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import React from 'react'

interface GasEstimationProps {
  addition?: BigNumber
}

export function OmniGasEstimation({ addition }: GasEstimationProps) {
  const {
    environment: { gasEstimation },
  } = useOmniGeneralContext()

  return <>{getEstimatedGasFeeText(gasEstimation, addition)}</>
}

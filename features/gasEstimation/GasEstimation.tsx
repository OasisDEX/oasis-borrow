import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'

export function GasEstimation() {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation)}</>
}

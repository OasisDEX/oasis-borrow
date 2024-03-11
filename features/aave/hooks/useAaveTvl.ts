import type { NetworkNames } from 'blockchain/networks'
import { useAaveContext } from 'features/aave'
import type { AaveTotalValueLocked } from 'features/aave/aave-context'
import { useObservable } from 'helpers/observableHook'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

export function useAaveTvl(
  protocol: AaveLendingProtocol | SparkLendingProtocol,
  network: NetworkNames,
): AaveTotalValueLocked | undefined {
  const { aaveTotalValueLocked$ } = useAaveContext(protocol, network)
  const [tvlState] = useObservable(aaveTotalValueLocked$)

  return tvlState
}

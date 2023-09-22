import type { NetworkIds } from 'blockchain/networks'
import { aaveHistorySupport } from 'features/aave/aave-history-support'

export function isAaveHistorySupported(networkId: NetworkIds): boolean | undefined {
  return aaveHistorySupport[networkId]
}

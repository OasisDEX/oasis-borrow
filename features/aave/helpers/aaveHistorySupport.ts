import { NetworkIds } from 'blockchain/networks'
import { aaveHistorySupport } from 'features/aave/config'

export function isAaveHistorySupported(networkId: NetworkIds): boolean | undefined {
  return aaveHistorySupport[networkId]
}

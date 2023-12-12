import type { NetworkIds } from 'blockchain/networks'
import { aaveHistorySupport } from 'features/aave/aave-history-support'
import { ProxyType } from 'features/aave/types'

export function isAaveHistorySupported(
  networkId: NetworkIds,
  proxyType: ProxyType,
): boolean | undefined {
  return aaveHistorySupport[networkId] && proxyType !== ProxyType.DsProxy
}

import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import type { IStrategyConfig, PositionId } from 'features/aave/types'
import { ProxyType } from 'features/aave/types'

export type DPMProxyForPosition = {
  dpmProxy: UserDpmAccount
  walletAddress: string
  dsProxy: undefined
}

export function shouldCreateOptimizationMachine(
  strategyConfig: IStrategyConfig,
  proxyType: ProxyType,
  positionId: PositionId,
  proxies: ProxiesRelatedWithPosition,
): proxies is DPMProxyForPosition {
  if (proxyType === ProxyType.DsProxy) {
    return false
  }
  if (!strategyConfig.isOptimizationTabEnabled()) {
    return false
  }

  if (!positionId.vaultId) {
    return false
  }

  return !!(proxies.dpmProxy && proxies.walletAddress)
}

import { NetworkIds } from 'blockchain/networks'
import type { AjnaWeeklyRewards } from 'features/omni-kit/protocols/ajna/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface IsPoolWithRewardsParams {
  collateralToken: string
  networkId: OmniSupportedNetworkIds
  quoteToken: string
}

export const ajnaWeeklyRewards: AjnaWeeklyRewards = {
  [NetworkIds.MAINNET]: {},
  [NetworkIds.BASEMAINNET]: {},
}

/**
 * Checks if a pool has rewards available
 * @param params - Pool parameters
 * @param params.collateralToken - Collateral token symbol
 * @param params.networkId - Network ID
 * @param params.quoteToken - Quote token symbol
 * @returns True if pool has rewards, false otherwise
 */
export function isPoolWithRewards({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolWithRewardsParams): boolean {
  return !!Object.keys(ajnaWeeklyRewards[networkId] ?? {})?.includes(
    `${collateralToken.replace(/-|:/gi, '')}-${quoteToken.replace(/-|:/gi, '')}`,
  )
}

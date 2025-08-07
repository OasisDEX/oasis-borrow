import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { AjnaWeeklyRewards } from 'features/omni-kit/protocols/ajna/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface IsPoolWithRewardsParams {
  collateralToken: string
  networkId: OmniSupportedNetworkIds
  quoteToken: string
}

export const ajnaWeeklyRewards: AjnaWeeklyRewards = {
  [NetworkIds.MAINNET]: {
  },
  [NetworkIds.BASEMAINNET]: {
  }
}

export function isPoolWithRewards({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolWithRewardsParams): boolean {
  return !!Object.keys(ajnaWeeklyRewards[networkId] ?? {})?.includes(
    `${collateralToken.replace(/-|:/gi, '')}-${quoteToken.replace(/-|:/gi, '')}`,
  )
}

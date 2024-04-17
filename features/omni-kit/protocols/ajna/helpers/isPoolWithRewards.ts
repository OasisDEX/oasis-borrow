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
    'ETH-USDC': {
      amount: new BigNumber(32000),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
  },
  [NetworkIds.BASEMAINNET]: {
    'ETH-USDC': {
      amount: new BigNumber(32000),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
  },
}

export function isPoolWithRewards({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolWithRewardsParams): boolean {
  return !!Object.keys(ajnaWeeklyRewards[networkId] ?? {})?.includes(
    `${collateralToken}-${quoteToken}`,
  )
}

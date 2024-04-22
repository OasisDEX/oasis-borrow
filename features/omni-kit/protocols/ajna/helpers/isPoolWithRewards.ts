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
    'RETH-DAI': {
      amount: new BigNumber(45920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WBTC-DAI': {
      amount: new BigNumber(45920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WSTETH-DAI': {
      amount: new BigNumber(45920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'ETH-USDC': {
      amount: new BigNumber(16400),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WBTC-USDC': {
      amount: new BigNumber(45920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WSTETH-USDC': {
      amount: new BigNumber(26240),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'USDC-ETH': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'USDC-WBTC': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WSTETH-ETH': {
      amount: new BigNumber(45920),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'RETH-ETH': {
      amount: new BigNumber(32800),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'SDAI-USDC': {
      amount: new BigNumber(39360),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'YFI-DAI': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'SYTETH-DAI': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'AJNA-DAI': {
      amount: new BigNumber(19680),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'MKR-DAI': {
      amount: new BigNumber(19680),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'SUSDE-DAI': {
      amount: new BigNumber(22960),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'MWSTETHWPUNKS20-WSTETH': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'MWSTETHWPUNKS40-WSTETH': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'ENA-SDAI': {
      amount: new BigNumber(4920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'SDAI-ENA': {
      amount: new BigNumber(4920),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
  },
  [NetworkIds.BASEMAINNET]: {
    'CBETH-ETH': {
      amount: new BigNumber(24600),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'ETH-USDC': {
      amount: new BigNumber(24600),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'WSTETH-ETH': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.05),
      earnShare: new BigNumber(0.95),
    },
    'DEGEN-USDC': {
      amount: new BigNumber(24600),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'USDC-DEGEN': {
      amount: new BigNumber(24600),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'SNX-USDC': {
      amount: new BigNumber(24600),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'PRIME-USDC': {
      amount: new BigNumber(13120),
      borrowShare: new BigNumber(0.4),
      earnShare: new BigNumber(0.6),
    },
    'AERO-USDC': {
      amount: new BigNumber(11480),
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
    `${collateralToken.replace(/-|:/gi, '')}-${quoteToken.replace(/-|:/gi, '')}`,
  )
}

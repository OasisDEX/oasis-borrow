import type BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { ManagePositionAvailableActions } from 'features/aave/types'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { FeaturesEnum } from 'types/config'

type TokenTicker = string

export type DepositTokensConfig = {
  protocol: AaveLendingProtocol | SparkLendingProtocol
  networkId: NetworkIds
  list: TokenTicker[]
  additionalManageActions?: Record<
    TokenTicker,
    | {
        action: ManagePositionAvailableActions
        featureToggle: FeaturesEnum | undefined
      }[]
    | undefined
  >
  featureToggle?: Record<TokenTicker, FeaturesEnum | undefined>
  defaultSlippage?: Record<TokenTicker, BigNumber>
}

type DepositTokensConfigList = DepositTokensConfig[]

export const depositTokensConfigList: DepositTokensConfigList = [
  {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.MAINNET,
    list: [
      'USDC',
      'DAI',
      'ETH',
      'WSTETH',
      'WBTC',
      'USDT',
      'SDAI',
      'RPL',
      'RETH',
      'LUSD',
      'AAVE',
      'CRV',
      'BAL',
      'MKR',
      'CBETH',
      'LDO',
      'LINK',
    ],
  },
  {
    protocol: LendingProtocol.SparkV3,
    networkId: NetworkIds.MAINNET,
    list: ['USDC', 'ETH', 'WSTETH', 'WBTC', 'USDT', 'RETH'],
  },
  {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.OPTIMISMMAINNET,
    list: ['ETH', 'WBTC', 'LINK', 'SUSD', 'RETH', 'OP', 'LUSD', 'USDC', 'USDT', 'DAI'],
  },
  {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.ARBITRUMMAINNET,
    list: ['ETH', 'WBTC', 'USDC', 'LINK', 'ARB', 'RETH', 'LUSD', 'USDT', 'DAI'],
  },
  {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.BASEMAINNET,
    list: ['ETH', 'USDBC'],
  },
]

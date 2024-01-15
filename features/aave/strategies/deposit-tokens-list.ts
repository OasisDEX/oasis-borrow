import { NetworkIds } from 'blockchain/networks'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

type DepositTokensList = {
  [key: string]: {
    protocol: AaveLendingProtocol | SparkLendingProtocol
    networkId: NetworkIds
    list: string[]
  }
}

export const depositTokensList: DepositTokensList = {
  [`${LendingProtocol.AaveV3}-${NetworkIds.MAINNET}`]: {
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
  [`${LendingProtocol.SparkV3}-${NetworkIds.MAINNET}`]: {
    protocol: LendingProtocol.SparkV3,
    networkId: NetworkIds.MAINNET,
    list: ['USDC', 'ETH', 'WSTETH', 'WBTC', 'USDT', 'RETH'],
  },
  [`${LendingProtocol.AaveV3}-${NetworkIds.OPTIMISMMAINNET}`]: {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.OPTIMISMMAINNET,
    list: ['ETH', 'WBTC', 'LINK', 'SUSD', 'RETH', 'OP', 'LUSD', 'USDC', 'USDT', 'DAI'],
  },
  [`${LendingProtocol.AaveV3}-${NetworkIds.ARBITRUMMAINNET}`]: {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.ARBITRUMMAINNET,
    list: ['ETH', 'WBTC', 'USDC', 'LINK', 'ARB', 'RETH', 'LUSD', 'USDT', 'DAI'],
  },
  [`${LendingProtocol.AaveV3}-${NetworkIds.BASEMAINNET}`]: {
    protocol: LendingProtocol.AaveV3,
    networkId: NetworkIds.BASEMAINNET,
    list: ['ETH', 'USDBC'],
  },
}

export const depositTokensListKeys = Object.keys(
  depositTokensList,
) as (keyof typeof depositTokensList)[]

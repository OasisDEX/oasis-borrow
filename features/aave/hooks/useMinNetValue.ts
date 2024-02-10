import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { IStrategyConfig } from 'features/aave/types'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import { match } from 'ts-pattern'

export function useMinNetValue(strategyConfig: IStrategyConfig) {
  const {
    automation: { minNetValueUSD, defaultMinValue },
  } = useAppConfig('parameters')

  const networkKey = match(strategyConfig.networkId)
    .when(
      (network) => NetworkIds.MAINNET === network,
      () => 'mainnet' as const,
    )
    .when(
      (network) => NetworkIds.OPTIMISMMAINNET === network,
      () => 'optimism' as const,
    )
    .when(
      (network) => NetworkIds.ARBITRUMMAINNET === network,
      () => 'arbitrum' as const,
    )
    .when(
      (network) => NetworkIds.BASEMAINNET === network,
      () => 'base' as const,
    )
    .otherwise(() => 'mainnet' as const)

  if (strategyConfig.networkId === NetworkIds.MAINNET) {
    if (strategyConfig.protocol === LendingProtocol.AaveV3) {
      return new BigNumber(minNetValueUSD.mainnet.aavev3)
    }
    if (strategyConfig.protocol === LendingProtocol.SparkV3) {
      return new BigNumber(minNetValueUSD.mainnet.sparkv3)
    }
  }

  const networkConfig = minNetValueUSD[networkKey]

  if (strategyConfig.protocol === LendingProtocol.AaveV3) {
    return new BigNumber(networkConfig.aavev3)
  }

  return new BigNumber(defaultMinValue)
}

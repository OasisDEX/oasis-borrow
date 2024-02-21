import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import type { IStrategyConfig } from 'features/aave/types'
import { useAppConfig } from 'helpers/config'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { match } from 'ts-pattern'

export function useMinNetValue(strategyConfig: IStrategyConfig) {
  const {
    automation: { minNetValueUSD, defaultMinValue },
  } = useAppConfig('parameters')
  const {
    AaveV3ProtectionLambdaArbitrum,
    AaveV3ProtectionLambdaBase,
    AaveV3ProtectionLambdaOptimism,
    AaveV3ProtectionLambdaEthereum,
    SparkProtectionLambdaEthereum,
    AaveV3OptimizationArbitrum,
    AaveV3OptimizationBase,
    AaveV3OptimizationOptimism,
    AaveV3OptimizationEthereum,
  } = useAppConfig('features')

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
      if (AaveV3ProtectionLambdaEthereum || AaveV3OptimizationEthereum) {
        return one
      }
      return new BigNumber(minNetValueUSD.mainnet.aavev3)
    }
    if (strategyConfig.protocol === LendingProtocol.SparkV3) {
      if (SparkProtectionLambdaEthereum) {
        return one
      }
      return new BigNumber(minNetValueUSD.mainnet.sparkv3)
    }
  }

  const networkConfig = minNetValueUSD[networkKey]

  if (strategyConfig.protocol === LendingProtocol.AaveV3) {
    if (
      (networkKey === 'optimism' &&
        (AaveV3ProtectionLambdaOptimism || AaveV3OptimizationOptimism)) ||
      (networkKey === 'arbitrum' &&
        (AaveV3ProtectionLambdaArbitrum || AaveV3OptimizationArbitrum)) ||
      (networkKey === 'base' && (AaveV3ProtectionLambdaBase || AaveV3OptimizationBase))
    ) {
      return one
    }
    return new BigNumber(networkConfig.aavev3)
  }

  return new BigNumber(defaultMinValue)
}

import { NetworkIds } from 'blockchain/networks'
import { AaveOpenPositionStopLoss } from 'features/aave/open/sidebars/components/AaveOpenPositionStopLoss'
import { AaveOpenPositionStopLossLambdaSidebar } from 'features/aave/open/sidebars/components/AaveOpenPositionStopLossLambdaSidebar'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import type { FeaturesEnum } from 'types/config'

function getLambdaProtectionFlag(
  protocol: LendingProtocol,
  networkId: NetworkIds,
  features: Record<FeaturesEnum, boolean | {}>,
) {
  if (protocol === LendingProtocol.SparkV3) {
    return features.SparkProtectionLambdaEthereum
  }
  const {
    AaveV3ProtectionLambdaArbitrum,
    AaveV3ProtectionLambdaBase,
    AaveV3ProtectionLambdaEthereum,
    AaveV3ProtectionLambdaOptimism,
  } = features

  switch (networkId) {
    case NetworkIds.OPTIMISMMAINNET:
      return AaveV3ProtectionLambdaOptimism
    case NetworkIds.ARBITRUMMAINNET:
      return AaveV3ProtectionLambdaArbitrum
    case NetworkIds.MAINNET:
      return AaveV3ProtectionLambdaEthereum
    case NetworkIds.BASEMAINNET:
      return AaveV3ProtectionLambdaBase
    default:
      return false
  }
}

export const SidebarOpenAaveVaultStopLoss = ({ state, send, isLoading }: OpenAaveStateProps) => {
  const lambdaProtectionFlag = getLambdaProtectionFlag(
    state.context.strategyConfig.protocol,
    state.context.strategyConfig.networkId,
    getLocalAppConfig('features'),
  )
  return lambdaProtectionFlag ? (
    <AaveOpenPositionStopLossLambdaSidebar state={state} send={send} isLoading={isLoading} />
  ) : (
    <AaveOpenPositionStopLoss state={state} send={send} isLoading={isLoading} />
  )
}

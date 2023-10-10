import type { GetOnChainPositionParams } from 'actions/aave-like'
import { getOnChainPosition } from 'actions/aave-like'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export const sparkV3OnChainPosition = (
  params: Omit<GetOnChainPositionParams & { networkId: SparkV3SupportedNetwork }, 'protocol'>,
) => {
  return getOnChainPosition({ ...params, protocol: LendingProtocol.SparkV3 })
}

import { getOnChainPosition, GetOnChainPositionParams } from 'actions/aave-like'
import { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export const sparkV3OnChainPosition = (
  params: Omit<GetOnChainPositionParams & { networkId: SparkV3SupportedNetwork }, 'protocol'>,
) => {
  return getOnChainPosition({ ...params, protocol: LendingProtocol.SparkV3 })
}

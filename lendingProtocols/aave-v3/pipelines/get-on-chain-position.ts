import type { GetOnChainPositionParams } from 'actions/aave-like'
import { getOnChainPosition } from 'actions/aave-like'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export const aaveV3OnChainPosition = (
  params: Omit<GetOnChainPositionParams & { networkId: AaveV3SupportedNetwork }, 'protocol'>,
) => {
  return getOnChainPosition({ ...params, protocol: LendingProtocol.AaveV3 })
}

import { getOnChainPosition, GetOnChainPositionParams } from 'actions/aave'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export const aaveV3OnChainPosition = (
  params: Omit<GetOnChainPositionParams & { networkId: AaveV3SupportedNetwork }, 'protocol'>,
) => {
  return getOnChainPosition({ ...params, protocol: LendingProtocol.AaveV3 })
}

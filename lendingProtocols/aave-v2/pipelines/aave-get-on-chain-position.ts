import { getOnChainPosition, GetOnChainPositionParams } from 'actions/aave'
import { NetworkIds } from 'blockchain/networkIds'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export type GetAaveV2OnChainPosition = Pick<
  GetOnChainPositionParams,
  'debtToken' | 'collateralToken' | 'proxyAddress'
>

export const aaveV2OnChainPosition = (params: GetAaveV2OnChainPosition) =>
  getOnChainPosition({
    ...params,
    protocol: LendingProtocol.AaveV2,
    networkId: NetworkIds.MAINNET,
  })

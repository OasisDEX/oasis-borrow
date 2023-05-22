import {
  getOnChainPosition as mainnetAction,
  GetOnChainPositionParams as MainnetParams,
} from 'actions/aave'
import {
  getOnChainPosition as optimismAction,
  GetOnChainPositionParams as OptimismParams,
} from 'actions/better-aave'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { NetworkIds } from 'blockchain/networkIds'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export type GetAaveV3OnChainPosition = Pick<
  MainnetParams & OptimismParams,
  'debtToken' | 'collateralToken' | 'proxyAddress'
>

export const aaveV3OnChainPosition = (
  params: GetAaveV3OnChainPosition & { networkId: AaveV3SupportedNetwork },
) => {
  if (params.networkId === NetworkIds.OPTIMISMMAINNET) {
    return optimismAction({ ...params, protocol: LendingProtocol.AaveV3 })
  }
  return mainnetAction({
    ...params,
    protocol: LendingProtocol.AaveV3,
  })
}

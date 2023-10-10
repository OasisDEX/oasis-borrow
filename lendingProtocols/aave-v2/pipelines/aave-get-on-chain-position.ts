import type { GetOnChainPositionParams } from 'actions/aave-like'
import { getOnChainPosition } from 'actions/aave-like'
import { NetworkIds } from 'blockchain/networks'
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

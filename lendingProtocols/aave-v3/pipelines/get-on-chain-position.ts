import { getOnChainPosition, GetOnChainPositionParams } from 'actions/aave'
import { NetworkIds } from 'blockchain/networkIds'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export type GetAaveV3OnChainPosition = Pick<
  GetOnChainPositionParams,
  'debtToken' | 'collateralToken' | 'proxyAddress'
>

export const aaveV3OnChainPosition = (
  params: GetAaveV3OnChainPosition & { networkId: NetworkIds.MAINNET },
) =>
  getOnChainPosition({
    ...params,
    protocol: LendingProtocol.AaveV2,
  })

import { getOnChainPosition, GetOnChainPositionParams } from 'actions/aave'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { LendingProtocol } from 'lendingProtocols/LendingProtocol'

export type GetAaveV3OnChainPosition = Pick<
  GetOnChainPositionParams,
  'debtToken' | 'collateralToken' | 'proxyAddress'
>

export const aaveV3OnChainPosition = (
  params: GetAaveV3OnChainPosition & { networkId: AaveV3SupportedNetwork },
) =>
  getOnChainPosition({
    ...params,
    protocol: LendingProtocol.AaveV3,
  })

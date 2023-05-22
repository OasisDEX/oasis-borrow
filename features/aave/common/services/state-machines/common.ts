import * as oldWrapper from 'actions/aave'
import * as newWrapper from 'actions/better-aave'
import { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { NetworkIds } from 'blockchain/networkIds'
import { LendingProtocol } from 'lendingProtocols'

type AaveV2NetworksProtocolParameters = {
  networkId: NetworkIds.MAINNET
  lendingProtocol: LendingProtocol.AaveV2
}
type AaveV3NetworkProtocolParameters = {
  networkId: AaveV3SupportedNetwork
  lendingProtocol: LendingProtocol.AaveV3
}

export type AaveNetworkProtocolParameters =
  | AaveV2NetworksProtocolParameters
  | AaveV3NetworkProtocolParameters

type AllActionKeys = keyof typeof oldWrapper | keyof typeof newWrapper

type PossibleActions = Extract<AllActionKeys, 'getOpenTransaction'>

export function getProperAction(params: AaveNetworkProtocolParameters, actionKey: PossibleActions) {
  if (params.networkId === NetworkIds.MAINNET) {
    return oldWrapper[actionKey]
  }
  return newWrapper[actionKey]
}

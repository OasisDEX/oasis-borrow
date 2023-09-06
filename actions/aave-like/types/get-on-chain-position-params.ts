import { NetworkIds } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export interface GetOnChainPositionParams {
  networkId: NetworkIds,
  collateralToken: string
  debtToken: string
  proxyAddress: string
  protocol: LendingProtocol
}

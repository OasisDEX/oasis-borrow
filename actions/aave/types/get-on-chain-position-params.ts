import { LendingProtocol } from 'lendingProtocols'
import { NetworkIds } from 'blockchain/networks'

export interface GetOnChainPositionParams {
  networkId: NetworkIds,
  collateralToken: string
  debtToken: string
  proxyAddress: string
  protocol: LendingProtocol
}

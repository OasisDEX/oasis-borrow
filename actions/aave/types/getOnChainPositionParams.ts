import { Context } from 'blockchain/network'
import { LendingProtocol } from 'lendingProtocols'

export interface GetOnChainPositionParams {
  context: Context
  collateralToken: string
  debtToken: string
  proxyAddress: string
  protocol: LendingProtocol
}

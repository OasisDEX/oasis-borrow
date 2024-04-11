import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetYieldsParams {
  ltv: BigNumber
  quoteToken: string
  collateralToken: string
  network: NetworkNames
  protocol: LendingProtocol
}

export interface GetYieldsResponse {}
